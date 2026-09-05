import {
  pgTable,
  serial,
  integer,
  uuid,
  varchar,
  text,
  boolean,
  numeric,
  doublePrecision,
  timestamp,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';

export const categoriesTable = pgTable(
  'categories',
  {
    id: serial('id').primaryKey(),
    parentId: integer('parent_id'),
    name: varchar('name', { length: 150 }).notNull(),
    slug: varchar('slug', { length: 190 }).notNull().unique(),
    description: text('description'),
    imageUrl: text('image_url'),
    sortOrder: integer('sort_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [index('categories_slug_idx').on(table.slug)],
);

export const productsTable = pgTable(
  'products',
  {
    id: serial('id').primaryKey(),
    sellerId: uuid('seller_id').references(() => usersTable.id, { onDelete: 'set null' }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categoriesTable.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 320 }).notNull().unique(),
    description: text('description'),
    longDescription: text('long_description'),
    price: numeric('price', { precision: 12, scale: 2 }).notNull().default('0'),
    originalPrice: numeric('original_price', { precision: 12, scale: 2 }),
    tag: varchar('tag', { length: 80 }),
    sku: varchar('sku', { length: 100 }),
    stock: integer('stock').default(0).notNull(),
    rating: doublePrecision('rating').default(0).notNull(),
    reviewsCount: integer('reviews_count').default(0).notNull(),
    status: varchar('status', { length: 30 }).default('published').notNull(),
    weight: varchar('weight', { length: 60 }),
    warranty: varchar('warranty', { length: 160 }),
    details: text('details'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('products_category_idx').on(table.categoryId),
    index('products_status_idx').on(table.status),
    unique('products_sku_unique').on(table.sku),
  ],
);

export const productImagesTable = pgTable(
  'product_images',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => productsTable.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    altText: text('alt_text'),
    position: integer('position').default(0).notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('product_images_product_idx').on(table.productId)],
);

export type CategoryDb = typeof categoriesTable.$inferSelect;
export type NewCategoryDb = typeof categoriesTable.$inferInsert;

export type ProductDb = typeof productsTable.$inferSelect;
export type NewProductDb = typeof productsTable.$inferInsert;

export type ProductImageDb = typeof productImagesTable.$inferSelect;
export type NewProductImageDb = typeof productImagesTable.$inferInsert;
