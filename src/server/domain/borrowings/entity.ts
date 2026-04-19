export type BorrowingStatus = "borrowed" | "pending_confirm" | "completed";

export type Borrowing = {
  id: string;
  keyId: string;
  keyName: string;
  userId: string;
  userName: string;
  borrowedAt: Date;
  returnedAt?: Date;
  confirmedAt?: Date;
  confirmedBy?: string;
  confirmedByName?: string;
  autoConfirmed?: boolean;
  reason: string;
  status: BorrowingStatus;
};
