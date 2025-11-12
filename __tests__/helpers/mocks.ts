import { mock } from 'bun:test'

/**
 * Create a mock database instance for testing
 */
export function createMockDatabase () {
  return {
    query: {
      users: {
        findFirst: mock(() => Promise.resolve(null))
      }
    },
    insert: mock(() => ({
      values: mock(() => ({
        returning: mock(() => Promise.resolve([{
          id: 'test-id',
          name: 'Test User',
          email: 'test@example.com',
          phone: '11999999999',
          role: 'CUSTOMER',
          createdAt: new Date(),
          updatedAt: new Date()
        }]))
      }))
    })),
    select: mock(() => ({
      from: mock(() => Promise.resolve([]))
    })),
    update: mock(() => ({
      set: mock(() => ({
        where: mock(() => Promise.resolve())
      }))
    })),
    delete: mock(() => ({
      where: mock(() => Promise.resolve())
    }))
  }
}

/**
 * Create a mock Meta Graph API service
 */
export function createMockMetaGraphAPI () {
  return {
    getMe: mock(() => Promise.resolve({
      id: '123456',
      name: 'Test Business'
    })),
    getBusinesses: mock(() => Promise.resolve({
      data: [
        { id: '123', name: 'Test Business' }
      ]
    })),
    getOwnedWABAs: mock(() => Promise.resolve({
      data: [
        { id: '456', name: 'Test WABA' }
      ]
    })),
    getPhoneNumbers: mock(() => Promise.resolve({
      data: [
        { id: '789', display_phone_number: '+55 11 99999-9999' }
      ]
    }))
  }
}
