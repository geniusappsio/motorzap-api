import chalk from 'chalk'

import { jobScheduler } from './scheduler'
import { syncWABAJob } from './sync-waba.job'

/**
 * Initialize and start all jobs
 */
export function initializeJobs (): void {
  console.log(chalk.magenta.bold('🚀 Initializing jobs...'))

  // Register all jobs
  jobScheduler.register(syncWABAJob)

  // Add more jobs here in the future
  // jobScheduler.register(otherJob)

  // Start the scheduler
  jobScheduler.start()

  console.log(chalk.green.bold('✅ Jobs initialized successfully'))
}

/**
 * Stop all jobs gracefully
 */
export function stopJobs (): void {
  console.log(chalk.yellow.bold('🛑 Stopping jobs...'))
  jobScheduler.stop()
  console.log(chalk.green('✅ Jobs stopped'))
}

// Export scheduler for manual control if needed
export { jobScheduler }
