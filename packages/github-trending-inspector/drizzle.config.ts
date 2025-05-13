import type { Config } from 'drizzle-kit'
import { env } from '$/env'

export default {
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: env.DATABASE_URL
  },
  verbose: true,
  strict: true
} satisfies Config
