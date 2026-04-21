import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  colour: text('colour').notNull().default('#3B82F6'),
});

export const applications = sqliteTable('applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  company: text('company').notNull(),
  role: text('role').notNull(),
  date: text('date').notNull(),
  categoryId: integer('category_id').notNull(),
  count: integer('count').notNull().default(1),
  notes: text('notes').default(''),
});

export const applicationStatusLogs = sqliteTable('application_status_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  applicationId: integer('application_id').notNull(),
  status: text('status').notNull(),
  date: text('date').notNull(),
});

export const targets = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  period: text('period').notNull(),
  goal: integer('goal').notNull(),
  categoryId: integer('category_id'),
});