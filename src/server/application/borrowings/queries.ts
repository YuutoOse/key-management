import type { BorrowingFilter } from "@/server/domain/borrowings/repository";
import { createBorrowingRepository } from "@/server/infrastructure/db/borrowings-repository";
import { db } from "@/server/lib/db";
import { listBorrowings } from "@/server/use-cases/borrowings/list-borrowings.usecase";

export const getBorrowings = (filter?: BorrowingFilter) =>
  listBorrowings({ borrowingRepo: createBorrowingRepository(db) })(filter);
