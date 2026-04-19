export type KeyStatus = "available" | "borrowed";

export type Key = {
  id: string;
  name: string;
  status: KeyStatus;
  borrowedBy?: string;
  borrowedById?: string;
  borrowedAt?: Date;
  reason?: string;
};
