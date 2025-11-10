import { faker } from '@faker-js/faker'
import chalk from 'chalk'

import { db } from './connection'
import { user } from './schema'

/**
 * Reset database and seed initial data
 */
// eslint-disable-next-line drizzle/enforce-delete-with-where
await db.delete(user)
console.log(chalk.yellowBright('🧹 All users deleted.'))

/**
 * Create initial users
 */
await db.insert(user).values([
  {
    name: faker.person.fullName(),
    phone: faker.phone.number(),
    role: 'CUSTOMER'
  }
])
console.log(chalk.greenBright('✅ Users seeded successfully!'))

process.exit()
