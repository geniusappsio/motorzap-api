import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { UserService } from '@/services/user/user.service'
import { createMockDatabase } from '../../helpers/mocks'

describe('UserService', () => {
  let userService: UserService
  let mockDb: any

  beforeEach(() => {
    mockDb = createMockDatabase()
    userService = new UserService(mockDb)
  })

  describe('create', () => {
    test('should create user successfully', async () => {
      // Arrange
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
        role: 'CUSTOMER'
      }

      // Act
      const result = await userService.create(dto)

      // Assert
      expect(result.isSuccess).toBe(true)
      expect(result.value.name).toBe('John Doe')
      expect(mockDb.insert).toHaveBeenCalled()
    })

    test('should fail if phone format is invalid', async () => {
      // Arrange
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: 'invalid-phone',
        role: 'CUSTOMER'
      }

      // Act
      const result = await userService.create(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error.message).toContain('phone')
      expect(mockDb.insert).not.toHaveBeenCalled()
    })

    test('should fail if role is invalid', async () => {
      // Arrange
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
        role: 'INVALID_ROLE'
      }

      // Act
      const result = await userService.create(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error.message).toContain('role')
      expect(mockDb.insert).not.toHaveBeenCalled()
    })

    test('should fail if user already exists', async () => {
      // Arrange
      // Mock the select().from().where().limit() chain used by findByPhone
      mockDb.select = mock(() => ({
        from: mock(() => ({
          where: mock(() => ({
            limit: mock(() => Promise.resolve([{
              id: 'existing-id',
              phone: '11999999999',
              name: 'Existing User',
              role: 'CUSTOMER',
              createdAt: new Date(),
              updatedAt: new Date()
            }]))
          }))
        }))
      }))

      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
        role: 'CUSTOMER'
      }

      // Act
      const result = await userService.create(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error.code).toBe('USER_ALREADY_EXISTS')
      expect(mockDb.insert).not.toHaveBeenCalled()
    })
  })

  describe('getById', () => {
    test('should return user if exists', async () => {
      // Arrange
      mockDb.select = mock(() => ({
        from: mock(() => ({
          where: mock(() => ({
            limit: mock(() => Promise.resolve([{
              id: 'test-id',
              name: 'John Doe',
              email: 'john@example.com',
              phone: '11999999999',
              role: 'CUSTOMER',
              createdAt: new Date(),
              updatedAt: new Date()
            }]))
          }))
        }))
      }))

      // Act
      const result = await userService.getById('test-id')

      // Assert
      expect(result.isSuccess).toBe(true)
      expect(result.value.id).toBe('test-id')
      expect(result.value.name).toBe('John Doe')
    })

    test('should fail if user not found', async () => {
      // Arrange
      mockDb.select = mock(() => ({
        from: mock(() => ({
          where: mock(() => ({
            limit: mock(() => Promise.resolve([]))
          }))
        }))
      }))

      // Act
      const result = await userService.getById('non-existent-id')

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error.code).toBe('USER_NOT_FOUND')
    })
  })
})
