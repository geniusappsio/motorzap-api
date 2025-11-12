import { db } from '@/database/connection'
import { user } from '@/database/schema/users'
import { businessManager } from '@/database/schema/business-managers'
import { whatsappBusinessAccount } from '@/database/schema/whatsapp/whatsapp-business-accounts'
import { whatsappPhoneNumber } from '@/database/schema/whatsapp/whatsapp-phone-numbers'

/**
 * Clean all test data from the database
 */
export async function cleanDatabase () {
  try {
    // Delete in order to respect foreign key constraints
    await db.delete(whatsappPhoneNumber)
    await db.delete(whatsappBusinessAccount)
    await db.delete(businessManager)
    await db.delete(user)

    console.log('✅ Database cleaned successfully')
  } catch (error) {
    console.error('❌ Error cleaning database:', error)
    throw error
  }
}

/**
 * Setup test database before running tests
 */
export async function setupTestDatabase () {
  // Add any initialization logic here if needed
  console.log('📦 Test database setup complete')
}

/**
 * Teardown test database after running tests
 */
export async function teardownTestDatabase () {
  await cleanDatabase()
  console.log('🧹 Test database teardown complete')
}
