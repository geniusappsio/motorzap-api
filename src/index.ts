import cluster from 'node:cluster'
import os from 'node:os'
import process from 'node:process'

import chalk from 'chalk'

import { initializeJobs, stopJobs } from './jobs'

if (cluster.isPrimary) {
  	console.log(chalk.magenta.bold(`🟣 Primary ${process.pid} is running`))

  	// Initialize jobs only in primary process
  	initializeJobs()

  	// Fork workers
  	const numWorkers = os.availableParallelism()
  	console.log(chalk.blue(`📦 Forking ${numWorkers} worker(s)...`))
  	for (let i = 0; i < numWorkers; i++)
    	cluster.fork()

  	// Handle worker exit and restart
  	cluster.on('exit', (worker, _code, _signal) => {
    	console.log(chalk.yellow(`⚠️  Worker ${worker.process.pid} died. Restarting...`))
    	cluster.fork()
  	})

  	// Graceful shutdown
  	process.on('SIGINT', () => {
    	console.log(chalk.red.bold('🛑 Shutting down primary process...'))
    	stopJobs()
    	process.exit(0)
  	})

  	process.on('SIGTERM', () => {
    	console.log(chalk.red.bold('🛑 Shutting down primary process...'))
    	stopJobs()
    	process.exit(0)
  	})
} else {
  	await import('./server')
  	console.log(chalk.green(`✅ Worker ${process.pid} started`))
}
