import { describe, expect, test } from 'bun:test'
import { User, Phone, Role } from '@/models/user'

describe('User Entity', () => {
  describe('create', () => {
    test('should create a valid user', () => {
      // Arrange
      const phone = Phone.createUnsafe('11999999999')
      const role = Role.createUnsafe('CUSTOMER')

      // Act
      const result = User.create({
        phone,
        role,
        name: 'John Doe',
        email: 'john@example.com'
      })

      // Assert
      expect(result.isSuccess).toBe(true)
      expect(result.value.getName()).toBe('John Doe')
      expect(result.value.getEmail()).toBe('john@example.com')
      expect(result.value.getPhone()).toBe(phone)
      expect(result.value.getRole()).toBe(role)
    })

    test('should fail if name is empty', () => {
      // Arrange
      const phone = Phone.createUnsafe('11999999999')
      const role = Role.createUnsafe('CUSTOMER')

      // Act
      const result = User.create({
        phone,
        role,
        name: '',
        email: 'john@example.com'
      })

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error.message).toContain('Name')
    })

    test('should fail if name is too long', () => {
      // Arrange
      const phone = Phone.createUnsafe('11999999999')
      const role = Role.createUnsafe('CUSTOMER')
      const longName = 'a'.repeat(256)

      // Act
      const result = User.create({
        phone,
        role,
        name: longName
      })

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error.message).toContain('255 characters')
    })

    test('should fail if email format is invalid', () => {
      // Arrange
      const phone = Phone.createUnsafe('11999999999')
      const role = Role.createUnsafe('CUSTOMER')

      // Act
      const result = User.create({
        phone,
        role,
        name: 'John Doe',
        email: 'invalid-email'
      })

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error.message).toContain('email')
    })

    test('should create user without email', () => {
      // Arrange
      const phone = Phone.createUnsafe('11999999999')
      const role = Role.createUnsafe('CUSTOMER')

      // Act
      const result = User.create({
        phone,
        role,
        name: 'John Doe'
      })

      // Assert
      expect(result.isSuccess).toBe(true)
      expect(result.value.getEmail()).toBeUndefined()
    })
  })

  describe('updateName', () => {
    test('should update user name successfully', () => {
      // Arrange
      const phone = Phone.createUnsafe('11999999999')
      const role = Role.createUnsafe('CUSTOMER')
      const user = User.create({
        phone,
        role,
        name: 'John Doe'
      }).value

      // Act
      const result = user.updateName('Jane Doe')

      // Assert
      expect(result.isSuccess).toBe(true)
      expect(user.getName()).toBe('Jane Doe')
    })

    test('should fail if new name is empty', () => {
      // Arrange
      const phone = Phone.createUnsafe('11999999999')
      const role = Role.createUnsafe('CUSTOMER')
      const user = User.create({
        phone,
        role,
        name: 'John Doe'
      }).value

      // Act
      const result = user.updateName('')

      // Assert
      expect(result.isFailure).toBe(true)
      expect(user.getName()).toBe('John Doe') // Name should not change
    })
  })

  describe('changeRole', () => {
    test('should change user role', () => {
      // Arrange
      const phone = Phone.createUnsafe('11999999999')
      const role = Role.createUnsafe('CUSTOMER')
      const user = User.create({
        phone,
        role,
        name: 'John Doe'
      }).value

      const newRole = Role.createUnsafe('ADMIN')

      // Act
      user.changeRole(newRole)

      // Assert
      expect(user.getRole()).toBe(newRole)
      expect(user.getRole().isAdmin()).toBe(true)
    })
  })
})
