import chalk from 'chalk'

import type { SyncResult } from '../services/waba-sync.service'
import { WABASyncService } from '../services/waba-sync.service'

export interface SyncBusinessManagerInput {
  businessManagerId: string
}

export interface SyncBusinessManagerOutput {
  success: boolean
  result: SyncResult
}

/**
 * Use case to synchronize a Business Manager with Meta Graph API
 *
 * This will:
 * 1. Fetch the Business Manager data from Meta using the stored access token
 * 2. Update the Business Manager record with Meta Business ID and other data
 * 3. Fetch all associated WABAs (owned and client)
 * 4. Fetch all phone numbers for each WABA
 * 5. Insert or update all records in the database
 */
export class SyncBusinessManagerUseCase {
  private readonly syncService: WABASyncService

  constructor () {
    this.syncService = new WABASyncService()
  }

  async execute (input: SyncBusinessManagerInput): Promise<SyncBusinessManagerOutput> {
    try {
      console.log(chalk.blue(`  Starting sync for Business Manager: ${chalk.cyan.bold(input.businessManagerId)}`))

      const result = await this.syncService.syncBusinessManager(input.businessManagerId)

      if (result.success) {
        console.log(
          chalk.green('  ✅ Sync completed successfully:'),
          chalk.gray(
            JSON.stringify(
              {
                businessManagerId: result.businessManagerId,
                metaBusinessId: result.metaBusinessId,
                wabasCount: result.wabasCount,
                phoneNumbersCount: result.phoneNumbersCount
              },
              null,
              2
            )
          )
        )
      } else {
        console.error(
          chalk.yellow('  ⚠️  Sync completed with errors:'),
          chalk.gray(
            JSON.stringify(
              {
                businessManagerId: result.businessManagerId,
                errors: result.errors
              },
              null,
              2
            )
          )
        )
      }

      return {
        success: result.success,
        result
      }
    } catch (error) {
      console.error(chalk.red('  ❌ Sync failed:'), error)

      return {
        success: false,
        result: {
          success: false,
          businessManagerId: input.businessManagerId,
          wabasCount: 0,
          phoneNumbersCount: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        }
      }
    }
  }
}
