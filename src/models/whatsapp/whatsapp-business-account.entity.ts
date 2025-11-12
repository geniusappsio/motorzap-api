import { randomUUID } from 'crypto'

import { BaseEntity, fail, ok, Result } from '@/shared'
import { InvalidWhatsAppBusinessAccountDataError } from './whatsapp-errors'

export interface WhatsAppBusinessAccountProps {
  businessManagerId: string;
  metaWabaId: string;
  name: string;
  currency: string;
  timezoneId?: string;
  messageTemplateNamespace?: string;
  accountReviewStatus?: string;
  businessVerificationStatus?: string;
  ownershipType?: string;
  conversationAnalyticsEnabled: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class WhatsAppBusinessAccount extends BaseEntity<WhatsAppBusinessAccountProps> {
  constructor (props: WhatsAppBusinessAccountProps, id: string) {
    super(props, id)
  }

  static create (data: {
    businessManagerId: string;
    metaWabaId: string;
    name: string;
    currency: string;
    timezoneId?: string;
    messageTemplateNamespace?: string;
    accountReviewStatus?: string;
    businessVerificationStatus?: string;
    ownershipType?: string;
    conversationAnalyticsEnabled?: boolean;
  }): Result<WhatsAppBusinessAccount> {
    const validation = WhatsAppBusinessAccount.validateCreateData(data)
    if (validation.isFailure) {
      return validation
    }

    const waba = new WhatsAppBusinessAccount(
      {
        businessManagerId: data.businessManagerId,
        metaWabaId: data.metaWabaId,
        name: data.name,
        currency: data.currency,
        timezoneId: data.timezoneId,
        messageTemplateNamespace: data.messageTemplateNamespace,
        accountReviewStatus: data.accountReviewStatus,
        businessVerificationStatus: data.businessVerificationStatus,
        ownershipType: data.ownershipType,
        conversationAnalyticsEnabled: data.conversationAnalyticsEnabled ?? false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      randomUUID()
    )

    return ok(waba)
  }

  static reconstitute (data: {
    id: string;
    businessManagerId: string;
    metaWabaId: string;
    name: string;
    currency: string;
    timezoneId?: string;
    messageTemplateNamespace?: string;
    accountReviewStatus?: string;
    businessVerificationStatus?: string;
    ownershipType?: string;
    conversationAnalyticsEnabled: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): WhatsAppBusinessAccount {
    return new WhatsAppBusinessAccount(
      {
        businessManagerId: data.businessManagerId,
        metaWabaId: data.metaWabaId,
        name: data.name,
        currency: data.currency,
        timezoneId: data.timezoneId,
        messageTemplateNamespace: data.messageTemplateNamespace,
        accountReviewStatus: data.accountReviewStatus,
        businessVerificationStatus: data.businessVerificationStatus,
        ownershipType: data.ownershipType,
        conversationAnalyticsEnabled: data.conversationAnalyticsEnabled,
        isActive: data.isActive,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      },
      data.id
    )
  }

  private static validateCreateData (data: {
    businessManagerId: string;
    metaWabaId: string;
    name: string;
    currency: string;
  }): Result<void> {
    if (!data.businessManagerId || data.businessManagerId.trim().length === 0) {
      return fail(new InvalidWhatsAppBusinessAccountDataError('Business Manager ID is required'))
    }

    if (!data.metaWabaId || data.metaWabaId.trim().length === 0) {
      return fail(new InvalidWhatsAppBusinessAccountDataError('Meta WABA ID is required'))
    }

    if (!data.name || data.name.trim().length === 0) {
      return fail(new InvalidWhatsAppBusinessAccountDataError('Name is required'))
    }

    if (data.name.length > 255) {
      return fail(new InvalidWhatsAppBusinessAccountDataError('Name cannot be longer than 255 characters'))
    }

    if (!data.currency || data.currency.trim().length === 0) {
      return fail(new InvalidWhatsAppBusinessAccountDataError('Currency is required'))
    }

    if (data.currency.length !== 3) {
      return fail(new InvalidWhatsAppBusinessAccountDataError('Currency must be a 3-letter ISO code (e.g., USD, BRL)'))
    }

    return ok(undefined as void)
  }

  // Getters
  getBusinessManagerId (): string {
    return this.props.businessManagerId
  }

  getMetaWabaId (): string {
    return this.props.metaWabaId
  }

  getName (): string {
    return this.props.name
  }

  getCurrency (): string {
    return this.props.currency
  }

  getTimezoneId (): string | undefined {
    return this.props.timezoneId
  }

  getMessageTemplateNamespace (): string | undefined {
    return this.props.messageTemplateNamespace
  }

  getAccountReviewStatus (): string | undefined {
    return this.props.accountReviewStatus
  }

  getBusinessVerificationStatus (): string | undefined {
    return this.props.businessVerificationStatus
  }

  getOwnershipType (): string | undefined {
    return this.props.ownershipType
  }

  isConversationAnalyticsEnabled (): boolean {
    return this.props.conversationAnalyticsEnabled
  }

  isActiveStatus (): boolean {
    return this.props.isActive
  }

  getCreatedAt (): Date {
    return this.props.createdAt
  }

  getUpdatedAt (): Date {
    return this.props.updatedAt
  }

  // Business methods
  updateName (newName: string): Result<void> {
    if (!newName || newName.trim().length === 0) {
      return fail(new InvalidWhatsAppBusinessAccountDataError('Name cannot be empty'))
    }

    if (newName.length > 255) {
      return fail(new InvalidWhatsAppBusinessAccountDataError('Name cannot be longer than 255 characters'))
    }

    this.props.name = newName
    this.props.updatedAt = new Date()
    return ok(undefined as void)
  }

  updateAccountStatus (reviewStatus: string, verificationStatus: string): void {
    this.props.accountReviewStatus = reviewStatus
    this.props.businessVerificationStatus = verificationStatus
    this.props.updatedAt = new Date()
  }

  enableConversationAnalytics (): void {
    this.props.conversationAnalyticsEnabled = true
    this.props.updatedAt = new Date()
  }

  disableConversationAnalytics (): void {
    this.props.conversationAnalyticsEnabled = false
    this.props.updatedAt = new Date()
  }

  deactivate (): void {
    this.props.isActive = false
    this.props.updatedAt = new Date()
  }

  activate (): void {
    this.props.isActive = true
    this.props.updatedAt = new Date()
  }

  validate (): Result<void> {
    return ok(undefined as void)
  }
}
