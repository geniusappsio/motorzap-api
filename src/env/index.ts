import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.url().min(1),
  PORT: z.coerce.number().min(1).max(65535).default(3333)
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format())
  throw new Error('Invalid environment variables')
}

export const env = _env.data
