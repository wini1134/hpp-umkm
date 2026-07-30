import { relations } from 'drizzle-orm';
import { integer, doublePrecision, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  userUid: text('user_uid').notNull(),
  name: text('name').notNull(),
  date: text('date').notNull(),
  hpp: doublePrecision('hpp').notNull(),
  sellingPrice: doublePrecision('selling_price').notNull(),
  platformName: text('platform_name').notNull(),
  netProfit: doublePrecision('net_profit').notNull(),
  netMargin: doublePrecision('net_margin').notNull(),
  roi: doublePrecision('roi').notNull(),
  monthlySalesVolumeEstimate: integer('monthly_sales_volume_estimate').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
}));
