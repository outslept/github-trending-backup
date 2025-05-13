import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { user } from './auth'

export const stars = sqliteTable('stars', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  repoName: text('repo_name').notNull(),
  starredAt: integer('starred_at', { mode: 'timestamp' }).notNull(),
  language: text('language'),
  description: text('description')
})
