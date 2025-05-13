import { db } from '$/db'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { betterAuth } from 'better-auth'
import { env } from '$/env'
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite'
  }),
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      scope: ['read:user', 'user:email', 'repo']
    }
  },
  plugins: [nextCookies()],
  baseUrl: env.NEXT_PUBLIC_APP_URL
})
