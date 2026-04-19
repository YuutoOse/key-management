import type { Borrowing } from "@/server/domain/borrowings/entity";
import type {
  BorrowingFilter,
  BorrowingRepository,
} from "@/server/domain/borrowings/repository";

type Deps = { borrowingRepo: BorrowingRepository };

export const listBorrowings =
  (deps: Deps) =>
  (filter?: BorrowingFilter): Promise<Borrowing[]> =>
    deps.borrowingRepo.findAll(filter);
