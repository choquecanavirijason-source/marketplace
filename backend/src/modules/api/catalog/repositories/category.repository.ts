import { Injectable } from '@nestjs/common';
import { and, asc, eq, ilike, inArray, isNull, sql } from 'drizzle-orm';
import { DrizzleService } from '../../../../infrastructure/database/drizzle.service';
import {
  categoriesTable,
  productsTable,
  CategoryDb,
} from '../../../../infrastructure/database/schema';

export interface CategoryWithCount {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  productsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const toCategoryWithCount = (row: CategoryDb, productsCount = 0): CategoryWithCount => ({
  id: row.id,
  parentId: row.parentId,
  name: row.name,
  slug: row.slug,
  description: row.description,
  imageUrl: row.imageUrl,
  sortOrder: row.sortOrder,
  isActive: row.isActive,
  productsCount,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

@Injectable()
export class CategoryRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  private countsFor = async (categoryIds: number[]): Promise<Map<number, number>> => {
    const map = new Map<number, number>();
    if (categoryIds.length === 0) return map;
    const rows = await this.drizzle.db
      .select({
        categoryId: productsTable.categoryId,
        total: sql<number>`count(*)::int`,
      })
      .from(productsTable)
      .where(
        and(
          eq(productsTable.status, 'published'),
          isNull(productsTable.deletedAt),
          inArray(productsTable.categoryId, categoryIds),
        ),
      )
      .groupBy(productsTable.categoryId);
    for (const r of rows) map.set(r.categoryId, Number(r.total));
    return map;
  };

  private decorate = async (rows: CategoryDb[]): Promise<CategoryWithCount[]> => {
    const counts = await this.countsFor(rows.map((r) => r.id));
    return rows.map((r) => toCategoryWithCount(r, counts.get(r.id) ?? 0));
  };

  listActive = async (): Promise<CategoryWithCount[]> => {
    const rows = await this.drizzle.db
      .select()
      .from(categoriesTable)
      .where(and(eq(categoriesTable.isActive, true), isNull(categoriesTable.deletedAt)))
      .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name));
    return this.decorate(rows);
  };

  findBySlug = async (slug: string): Promise<CategoryWithCount | null> => {
    const rows = await this.drizzle.db
      .select()
      .from(categoriesTable)
      .where(and(eq(categoriesTable.slug, slug), eq(categoriesTable.isActive, true), isNull(categoriesTable.deletedAt)))
      .limit(1);
    if (!rows[0]) return null;
    const [decorated] = await this.decorate([rows[0]]);
    return decorated;
  };
}
