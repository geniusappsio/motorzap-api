import { eq } from 'drizzle-orm'

import { db } from '../../../infrastructure/database/drizzle/connection'
import { businessManager } from '../../../infrastructure/database/drizzle/schema/business-managers'
import { whatsappBusinessAccount } from '../../../infrastructure/database/drizzle/schema/whatsapp-business-accounts'
import { whatsappPhoneNumber } from '../../../infrastructure/database/drizzle/schema/whatsapp-phone-numbers'
import type { MetaPhoneNumber, MetaWABA } from '../types/meta-graph-api.types'
import { MetaGraphAPIService } from './meta-graph-api.service'

export interface SyncResult {
  success: boolean
  businessManagerId: string
  metaBusinessId?: string
  wabasCount: number
  phoneNumbersCount: number
  errors: string[]
}

export class WABASyncService {
  /**
   * Sync a Business Manager and all its WABAs and Phone Numbers
   */
  async syncBusinessManager (businessManagerId: string): Promise<SyncResult> {
    const errors: string[] = []
    let wabasCount = 0
    let phoneNumbersCount = 0
    let metaBusinessId: string | undefined

    try {
      // 1. Get Business Manager from database
      const [bm] = await db
        .select()
        .from(businessManager)
        .where(eq(businessManager.id, businessManagerId))
        .limit(1)

      if (!bm) {
        throw new Error(`Business Manager with ID ${businessManagerId} not found`)
      }

      if (!bm.accessToken) {
        throw new Error(`Business Manager ${businessManagerId} has no access token`)
      }

      // 2. Initialize Meta Graph API client
      const metaAPI = new MetaGraphAPIService(bm.accessToken)

      // 3. Get businesses from Meta
      const businessesResponse = await metaAPI.getBusinesses()

      if (!businessesResponse.data || businessesResponse.data.length === 0) {
        errors.push('No businesses found for this access token')
        return {
          success: false,
          businessManagerId,
          wabasCount: 0,
          phoneNumbersCount: 0,
          errors
        }
      }

      // Use the first business (usually there's only one per system user)
      const metaBusiness = businessesResponse.data[0]
      metaBusinessId = metaBusiness.id

      // 4. Update Business Manager with Meta Business ID and name
      await db
        .update(businessManager)
        .set({
          metaBusinessId: metaBusiness.id,
          name: metaBusiness.name,
          verificationStatus: metaBusiness.verification_status || null,
          lastSyncedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(businessManager.id, businessManagerId))

      // 5. Get owned WABAs
      const wabasResponse = await metaAPI.getOwnedWABAs(metaBusiness.id)

      // 6. Sync each WABA
      for (const metaWABA of wabasResponse.data) {
        try {
          const wabaResult = await this.syncWABA(businessManagerId, metaWABA, 'OWNED')
          wabasCount++
          phoneNumbersCount += wabaResult.phoneNumbersCount
        } catch (error) {
          errors.push(`Failed to sync WABA ${metaWABA.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // 7. Try to get client WABAs (shared WABAs)
      try {
        const clientWABAsResponse = await metaAPI.getClientWABAs(metaBusiness.id)
        for (const metaWABA of clientWABAsResponse.data) {
          try {
            const wabaResult = await this.syncWABA(businessManagerId, metaWABA, 'CLIENT')
            wabasCount++
            phoneNumbersCount += wabaResult.phoneNumbersCount
          } catch (error) {
            errors.push(`Failed to sync client WABA ${metaWABA.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }
      } catch (error) {
        // Client WABAs might not be accessible, just log and continue
        console.log(`Could not fetch client WABAs: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      return {
        success: errors.length === 0,
        businessManagerId,
        metaBusinessId,
        wabasCount,
        phoneNumbersCount,
        errors
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error')
      return {
        success: false,
        businessManagerId,
        metaBusinessId,
        wabasCount,
        phoneNumbersCount,
        errors
      }
    }
  }

  /**
   * Sync a single WABA and its phone numbers
   */
  private async syncWABA (
    businessManagerId: string,
    metaWABA: MetaWABA,
    ownershipType: 'OWNED' | 'CLIENT' | 'SHARED'
  ): Promise<{ phoneNumbersCount: number }> {
    let phoneNumbersCount = 0

    // 1. Check if WABA already exists
    const [existingWABA] = await db
      .select()
      .from(whatsappBusinessAccount)
      .where(eq(whatsappBusinessAccount.metaWabaId, metaWABA.id))
      .limit(1)

    let wabaId: string

    if (existingWABA) {
      // Update existing WABA
      await db
        .update(whatsappBusinessAccount)
        .set({
          name: metaWABA.name,
          currency: metaWABA.currency,
          timezoneId: metaWABA.timezone_id,
          messageTemplateNamespace: metaWABA.message_template_namespace,
          accountReviewStatus: metaWABA.account_review_status || null,
          businessVerificationStatus: metaWABA.business_verification_status || null,
          ownershipType,
          updatedAt: new Date()
        })
        .where(eq(whatsappBusinessAccount.id, existingWABA.id))

      wabaId = existingWABA.id
    } else {
      // Insert new WABA
      const [newWABA] = await db
        .insert(whatsappBusinessAccount)
        .values({
          businessManagerId,
          metaWabaId: metaWABA.id,
          name: metaWABA.name,
          currency: metaWABA.currency,
          timezoneId: metaWABA.timezone_id,
          messageTemplateNamespace: metaWABA.message_template_namespace,
          accountReviewStatus: metaWABA.account_review_status || null,
          businessVerificationStatus: metaWABA.business_verification_status || null,
          ownershipType,
          isActive: true
        })
        .returning({ id: whatsappBusinessAccount.id })

      wabaId = newWABA.id
    }

    // 2. Sync phone numbers for this WABA
    const metaAPI = new MetaGraphAPIService(
      (await db.select({ accessToken: businessManager.accessToken })
        .from(businessManager)
        .where(eq(businessManager.id, businessManagerId))
        .limit(1))[0].accessToken
    )

    const phoneNumbersResponse = await metaAPI.getPhoneNumbers(metaWABA.id)

    for (const metaPhone of phoneNumbersResponse.data) {
      await this.syncPhoneNumber(wabaId, metaPhone)
      phoneNumbersCount++
    }

    return { phoneNumbersCount }
  }

  /**
   * Sync a single phone number
   */
  private async syncPhoneNumber (wabaId: string, metaPhone: MetaPhoneNumber): Promise<void> {
    // 1. Check if phone number already exists
    const [existingPhone] = await db
      .select()
      .from(whatsappPhoneNumber)
      .where(eq(whatsappPhoneNumber.metaPhoneNumberId, metaPhone.id))
      .limit(1)

    // Extract phone number from display format (remove spaces, dashes, etc)
    const cleanPhoneNumber = metaPhone.display_phone_number.replace(/[\s\-()]/g, '')

    if (existingPhone) {
      // Update existing phone number
      await db
        .update(whatsappPhoneNumber)
        .set({
          phoneNumber: cleanPhoneNumber,
          displayPhoneNumber: metaPhone.display_phone_number,
          verifiedName: metaPhone.verified_name,
          nameStatus: metaPhone.name_status || null,
          qualityRating: metaPhone.quality_rating || null,
          status: metaPhone.status || 'CONNECTED',
          platformType: metaPhone.platform_type || null,
          messagingLimitTier: metaPhone.messaging_limit_tier || null,
          isOfficialBusinessAccount: metaPhone.is_official_business_account || false,
          throughputLevel: metaPhone.throughput?.level || null,
          codeVerificationStatus: metaPhone.code_verification_status || null,
          certificate: metaPhone.certificate || null,
          lastStatusCheck: new Date(),
          updatedAt: new Date()
        })
        .where(eq(whatsappPhoneNumber.id, existingPhone.id))
    } else {
      // Insert new phone number
      await db
        .insert(whatsappPhoneNumber)
        .values({
          wabaId,
          metaPhoneNumberId: metaPhone.id,
          phoneNumber: cleanPhoneNumber,
          displayPhoneNumber: metaPhone.display_phone_number,
          verifiedName: metaPhone.verified_name,
          nameStatus: metaPhone.name_status || null,
          qualityRating: metaPhone.quality_rating || null,
          status: metaPhone.status || 'CONNECTED',
          platformType: metaPhone.platform_type || null,
          messagingLimitTier: metaPhone.messaging_limit_tier || null,
          isOfficialBusinessAccount: metaPhone.is_official_business_account || false,
          throughputLevel: metaPhone.throughput?.level || null,
          codeVerificationStatus: metaPhone.code_verification_status || null,
          certificate: metaPhone.certificate || null,
          isActive: true,
          lastStatusCheck: new Date()
        })
    }
  }
}
