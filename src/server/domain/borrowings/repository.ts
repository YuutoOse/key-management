import type { Borrowing, BorrowingStatus } from "./entity";

export type BorrowingFilter = {
  userId?: string;
  keyId?: string;
  keyIds?: string[];
  status?: BorrowingStatus;
};

export type BorrowingRepository = {
  findAll(filter?: BorrowingFilter): Promise<Borrowing[]>;
  findById(id: string): Promise<Borrowing | null>;
  updateMany(borrowings: Borrowing[]): Promise<void>;
  createManyWithAutoConfirm(
    newBorrowings: Omit<Borrowing, "id" | "keyName" | "userName">[],
    autoConfirm: Borrowing[],
  ): Promise<void>;
};
