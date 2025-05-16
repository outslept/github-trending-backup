import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './auth'

export const stars = pgTable('stars', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  repoName: text('repo_name').notNull(),
  starredAt: timestamp('starred_at').notNull(),
  language: text('language'),
  description: text('description'),
})
