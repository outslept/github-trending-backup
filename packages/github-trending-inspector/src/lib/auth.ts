import process from 'node:process'
import { db } from '$/db'
import { env } from '$/keys'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      scope: ['read:user', 'user:email', 'repo'],
    },
  },
  plugins: [nextCookies()],
  baseURL: env.NEXT_PUBLIC_APP_URL,
})
