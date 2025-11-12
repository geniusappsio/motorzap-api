import chalk from 'chalk'

export interface Job {
  name: string
  enabled: boolean
  intervalMs: number
  run: () => Promise<void>
}

export class JobScheduler {
  private jobs: Map<string, { job: Job; timerId: Timer | null }> = new Map()
  private isRunning = false

  /**
   * Register a job to be executed periodically
   */
  register (job: Job): void {
    if (this.jobs.has(job.name)) {
      console.warn(chalk.yellow(`⚠️  Job "${job.name}" is already registered. Skipping.`))
      return
    }

    this.jobs.set(job.name, { job, timerId: null })
    console.log(
      chalk.green(`✅ Registered job: ${chalk.cyan(job.name)} ${chalk.gray(`(interval: ${job.intervalMs}ms, enabled: ${job.enabled})`)}`)
    )
  }

  /**
   * Start all enabled jobs
   */
  start (): void {
    if (this.isRunning) {
      console.warn(chalk.yellow('⚠️  Scheduler is already running'))
      return
    }

    this.isRunning = true
    console.log(chalk.magenta.bold('🚀 Starting job scheduler...'))

    for (const [name, { job }] of this.jobs) {
      if (job.enabled) {
        this.startJob(name)
      } else {
        console.log(chalk.gray(`⏸️  Job "${name}" is disabled, skipping`))
      }
    }

    console.log(chalk.green.bold(`✅ Started ${this.getActiveJobsCount()} job(s)`))
  }

  /**
   * Stop all running jobs
   */
  stop (): void {
    console.log(chalk.yellow.bold('🛑 Stopping all jobs...'))

    for (const [name, { timerId }] of this.jobs) {
      if (timerId) {
        clearInterval(timerId)
        this.jobs.get(name)!.timerId = null
        console.log(chalk.gray(`  Stopped job: ${name}`))
      }
    }

    this.isRunning = false
    console.log(chalk.green('✅ All jobs stopped'))
  }

  /**
   * Start a specific job
   */
  private startJob (name: string): void {
    const entry = this.jobs.get(name)
    if (!entry) {
      console.error(chalk.red(`❌ Job "${name}" not found`))
      return
    }

    const { job } = entry

    // Run immediately on start
    this.runJob(job)

    // Schedule periodic execution
    const timerId = setInterval(() => {
      this.runJob(job)
    }, job.intervalMs)

    entry.timerId = timerId
    console.log(chalk.blue(`▶️  Started job: ${chalk.cyan(name)}`))
  }

  /**
   * Execute a job with error handling
   */
  private async runJob (job: Job): Promise<void> {
    const startTime = Date.now()
    console.log(chalk.cyan(`🔄 Running job: ${chalk.bold(job.name)}`))

    try {
      await job.run()
      const duration = Date.now() - startTime
      console.log(chalk.green(`✅ Job "${chalk.bold(job.name)}" completed in ${chalk.cyan(`${duration}ms`)}`))
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(chalk.red(`❌ Job "${chalk.bold(job.name)}" failed after ${duration}ms:`), error)
    }
  }

  /**
   * Get count of active (running) jobs
   */
  private getActiveJobsCount (): number {
    return Array.from(this.jobs.values()).filter((entry) => entry.timerId !== null).length
  }

  /**
   * Get all registered jobs
   */
  getJobs (): Job[] {
    return Array.from(this.jobs.values()).map((entry) => entry.job)
  }

  /**
   * Check if scheduler is running
   */
  getIsRunning (): boolean {
    return this.isRunning
  }
}

// Global singleton instance
export const jobScheduler = new JobScheduler()
