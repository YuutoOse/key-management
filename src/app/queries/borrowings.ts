import "server-only";
import { getBorrowings } from "@/server/application/borrowings/queries";
import type { BorrowingFilter } from "@/server/domain/borrowings/repository";

export const queryBorrowings = (filter?: BorrowingFilter) =>
  getBorrowings(filter);
