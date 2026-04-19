import { and, eq, inArray } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { alias } from "drizzle-orm/pg-core";
import type {
  Borrowing,
  BorrowingStatus,
} from "@/server/domain/borrowings/entity";
import type {
  BorrowingFilter,
  BorrowingRepository,
} from "@/server/domain/borrowings/repository";
import * as schema from "@/server/lib/db/schema";

type Schema = typeof schema;
type DB = NodePgDatabase<Schema>;

const confirmedByUser = alias(schema.user, "confirmed_by_user");

type JoinedRow = {
  borrowings: typeof schema.borrowings.$inferSelect;
  keys: { name: string } | null;
  user: { name: string } | null;
  confirmed_by_user: { name: string } | null;
};

const mapRow = (row: JoinedRow): Borrowing => ({
  id: row.borrowings.id,
  keyId: row.borrowings.keyId,
  keyName: row.keys?.name ?? "",
  userId: row.borrowings.userId,
  userName: row.user?.name ?? "",
  borrowedAt: row.borrowings.borrowedAt,
  returnedAt: row.borrowings.returnedAt ?? undefined,
  confirmedAt: row.borrowings.confirmedAt ?? undefined,
  confirmedBy: row.borrowings.confirmedBy ?? undefined,
  confirmedByName: row.confirmed_by_user?.name ?? undefined,
  autoConfirmed: row.borrowings.autoConfirmed ?? undefined,
  reason: row.borrowings.reason,
  status: row.borrowings.status as BorrowingStatus,
});

const joinedSelect = {
  borrowings: schema.borrowings,
  keys: { name: schema.keys.name },
  user: { name: schema.user.name },
  confirmed_by_user: { name: confirmedByUser.name },
};

export const createBorrowingRepository = (db: DB): BorrowingRepository => ({
  findAll: async (filter?: BorrowingFilter): Promise<Borrowing[]> => {
    const conditions = [
      filter?.userId ? eq(schema.borrowings.userId, filter.userId) : undefined,
      filter?.keyId ? eq(schema.borrowings.keyId, filter.keyId) : undefined,
      filter?.keyIds?.length
        ? inArray(schema.borrowings.keyId, filter.keyIds)
        : undefined,
      filter?.status ? eq(schema.borrowings.status, filter.status) : undefined,
    ].filter((condition) => condition !== undefined);

    const rows = await db
      .select(joinedSelect)
      .from(schema.borrowings)
      .innerJoin(schema.keys, eq(schema.borrowings.keyId, schema.keys.id))
      .innerJoin(schema.user, eq(schema.borrowings.userId, schema.user.id))
      .leftJoin(
        confirmedByUser,
        eq(schema.borrowings.confirmedBy, confirmedByUser.id),
      )
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(schema.borrowings.borrowedAt);
    return rows.map(mapRow);
  },

  findById: async (id): Promise<Borrowing | null> => {
    const rows = await db
      .select(joinedSelect)
      .from(schema.borrowings)
      .innerJoin(schema.keys, eq(schema.borrowings.keyId, schema.keys.id))
      .innerJoin(schema.user, eq(schema.borrowings.userId, schema.user.id))
      .leftJoin(
        confirmedByUser,
        eq(schema.borrowings.confirmedBy, confirmedByUser.id),
      )
      .where(eq(schema.borrowings.id, id))
      .limit(1);
    return rows[0] ? mapRow(rows[0]) : null;
  },

  updateMany: async (borrowings): Promise<void> => {
    if (borrowings.length === 0) return;
    await db.transaction(async (tx) => {
      for (const borrowing of borrowings) {
        await tx
          .update(schema.borrowings)
          .set({
            returnedAt: borrowing.returnedAt ?? null,
            confirmedAt: borrowing.confirmedAt ?? null,
            confirmedBy: borrowing.confirmedBy ?? null,
            autoConfirmed: borrowing.autoConfirmed ?? false,
            status: borrowing.status,
          })
          .where(eq(schema.borrowings.id, borrowing.id));
      }
    });
  },

  createManyWithAutoConfirm: async (
    newBorrowings,
    autoConfirm,
  ): Promise<void> => {
    await db.transaction(async (tx) => {
      for (const borrowing of autoConfirm) {
        await tx
          .update(schema.borrowings)
          .set({
            returnedAt: borrowing.returnedAt ?? null,
            confirmedAt: borrowing.confirmedAt ?? null,
            confirmedBy: borrowing.confirmedBy ?? null,
            autoConfirmed: borrowing.autoConfirmed ?? false,
            status: borrowing.status,
          })
          .where(eq(schema.borrowings.id, borrowing.id));
      }
      if (newBorrowings.length > 0) {
        await tx.insert(schema.borrowings).values(
          newBorrowings.map((borrowing) => ({
            keyId: borrowing.keyId,
            userId: borrowing.userId,
            borrowedAt: borrowing.borrowedAt,
            returnedAt: borrowing.returnedAt ?? null,
            confirmedAt: borrowing.confirmedAt ?? null,
            confirmedBy: borrowing.confirmedBy ?? null,
            autoConfirmed: borrowing.autoConfirmed ?? false,
            reason: borrowing.reason,
            status: borrowing.status,
          })),
        );
      }
    });
  },
});
