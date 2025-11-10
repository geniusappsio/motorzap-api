import z from 'zod'

export const createUserSchema = z.object({
  phone: z.string().min(10).max(20).describe('User phone number (Brazilian format)'),
  role: z.enum(['MANAGER', 'CUSTOMER', 'ADMIN']).default('CUSTOMER').describe('User role'),
  name: z.string().min(1).max(255).describe('User full name'),
  email: z.string().email().optional().describe('User email address')
})

export type CreateUserValidationInput = z.infer<typeof createUserSchema>;

export const getUserByIdSchema = z.object({
  id: z.string().uuid().describe('User ID')
})

export type GetUserByIdValidationInput = z.infer<typeof getUserByIdSchema>;

export const updateUserSchema = z.object({
  id: z.string().uuid().describe('User ID'),
  name: z.string().min(1).max(255).optional().describe('User full name'),
  email: z.string().email().optional().describe('User email address'),
  role: z.enum(['MANAGER', 'CUSTOMER', 'ADMIN']).optional().describe('User role')
})

export type UpdateUserValidationInput = z.infer<typeof updateUserSchema>;
