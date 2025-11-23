import chalk from 'chalk'
import { isNotNull } from 'drizzle-orm'

import { businessManager } from '@/database/schema/business-managers'
import { WABASyncService } from '@/services/whatsapp/waba-sync.service'

import { db } from '../database/connection'
import type { Job } from './scheduler'

/**
 * Job to sync all Business Managers with valid access tokens
 *
 * This job will:
 * 1. Find all Business Managers with a valid access token
 * 2. Sync each one with Meta Graph API
 * 3. Update WABAs and Phone Numbers
 *
 * Recommended interval: 1 hour (3600000ms)
 */
export const syncWABAJob: Job = {
  name: 'sync-waba',
  enabled: true,
  intervalMs: 3600000, // 1 hour

  async run () {
    console.log(chalk.cyan.bold('🔄 Starting WABA sync job...'))

    try {
      // 1. Find all Business Managers with access tokens
      const businessManagers = await db
        .select({
          id: businessManager.id,
          name: businessManager.name,
          metaBusinessId: businessManager.metaBusinessId,
          isActive: businessManager.isActive
        })
        .from(businessManager)
        .where(isNotNull(businessManager.accessToken))

      if (businessManagers.length === 0) {
        console.log(chalk.blue('ℹ️  No Business Managers found with access tokens'))
        return
      }

      console.log(chalk.blue(`📋 Found ${chalk.cyan.bold(businessManagers.length)} Business Manager(s) to sync`))

      // 2. Sync each Business Manager
      const syncService = new WABASyncService()
      const results = []

      for (const bm of businessManagers) {
        if (!bm.isActive) {
          console.log(chalk.gray(`⏭️  Skipping inactive Business Manager: ${bm.id}`))
          continue
        }

        const bmName = bm.name || 'unnamed'
        console.log(chalk.cyan(`🔄 Syncing Business Manager: ${chalk.bold(bm.id)} ${chalk.gray(`(${bmName})`)}`))

        const result = await syncService.syncBusinessManager(bm.id)

        results.push({
          id: bm.id,
          name: bm.name,
          success: result.success,
          wabasCount: result.wabasCount,
          phoneNumbersCount: result.phoneNumbersCount,
          errors: result.errors
        })
      }

      // 3. Summary
      const successCount = results.filter((r) => r.success).length
      const failureCount = results.filter((r) => !r.success).length
      const totalWABAs = results.reduce((sum, r) => sum + r.wabasCount, 0)
      const totalPhoneNumbers = results.reduce((sum, r) => sum + r.phoneNumbersCount, 0)

      console.log(
        chalk.green.bold('✅ Sync job completed:'),
        chalk.cyan(
          JSON.stringify(
            {
              total: businessManagers.length,
              success: successCount,
              failed: failureCount,
              totalWABAs,
              totalPhoneNumbers
            },
            null,
            2
          )
        )
      )

      // Log failures
      if (failureCount > 0) {
        console.error(chalk.red.bold('❌ Failed syncs:'))
        results
          .filter((r) => !r.success)
          .forEach((r) => {
            console.error(chalk.red(`  - ${r.id} ${chalk.gray(`(${r.name})`)}: ${r.errors.join(', ')}`))
          })
      }
    } catch (error) {
      console.error(chalk.red.bold('❌ Job execution failed:'), error)
      throw error
    }
  }
}
