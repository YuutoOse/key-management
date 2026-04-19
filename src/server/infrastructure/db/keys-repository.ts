import { and, eq, inArray } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Key, KeyStatus } from "@/server/domain/keys/entity";
import type { KeyRepository } from "@/server/domain/keys/repository";
import * as schema from "@/server/lib/db/schema";

type Schema = typeof schema;
type DB = NodePgDatabase<Schema>;

type KeyRow = {
  id: string;
  name: string;
  borrowedBy: string | null;
  borrowedById: string | null;
  borrowedAt: Date | null;
  reason: string | null;
};

const mapRow = (row: KeyRow): Key => ({
  id: row.id,
  name: row.name,
  status: (row.borrowedById ? "borrowed" : "available") as KeyStatus,
  borrowedBy: row.borrowedBy ?? undefined,
  borrowedById: row.borrowedById ?? undefined,
  borrowedAt: row.borrowedAt ?? undefined,
  reason: row.reason ?? undefined,
});

const selectKeys = (db: DB) =>
  db
    .select({
      id: schema.keys.id,
      name: schema.keys.name,
      borrowedBy: schema.user.name,
      borrowedById: schema.borrowings.userId,
      borrowedAt: schema.borrowings.borrowedAt,
      reason: schema.borrowings.reason,
    })
    .from(schema.keys)
    .leftJoin(
      schema.borrowings,
      and(
        eq(schema.keys.id, schema.borrowings.keyId),
        eq(schema.borrowings.status, "borrowed"),
      ),
    )
    .leftJoin(schema.user, eq(schema.borrowings.userId, schema.user.id));

export const createKeyRepository = (db: DB): KeyRepository => ({
  findAll: async (): Promise<Key[]> => {
    const rows = await selectKeys(db);
    return rows.map(mapRow);
  },

  findManyByIds: async (ids): Promise<Key[]> => {
    if (ids.length === 0) return [];
    const rows = await selectKeys(db).where(inArray(schema.keys.id, ids));
    return rows.map(mapRow);
  },
});
