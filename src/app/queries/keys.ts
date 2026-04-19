import "server-only";
import type { BorrowingFilter } from "@/server/domain/borrowings/repository";
import { createBorrowingRepository } from "@/server/infrastructure/db/borrowings-repository";
import { createKeyRepository } from "@/server/infrastructure/db/keys-repository";
import { db } from "@/server/lib/db";
import { listBorrowings } from "@/server/use-cases/borrowings/list-borrowings.usecase";
import { listKeys } from "@/server/use-cases/keys/list-keys.usecase";

const makeDeps = () => ({
  keyRepo: createKeyRepository(db),
  borrowingRepo: createBorrowingRepository(db),
});

export const queryKeys = () => listKeys(makeDeps())();

export const queryBorrowings = (filter?: BorrowingFilter) =>
  listBorrowings(makeDeps())(filter);
