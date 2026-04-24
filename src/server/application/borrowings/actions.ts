import { z } from "zod";
import { UnauthorizedError, ValidationError } from "@/server/domain/errors";
import { createBorrowingRepository } from "@/server/infrastructure/db/borrowings-repository";
import { createKeyRepository } from "@/server/infrastructure/db/keys-repository";
import { auth } from "@/server/lib/auth";
import { db } from "@/server/lib/db";
import { confirmReturn } from "@/server/use-cases/borrowings/confirm-return.usecase";
import { borrowKeys } from "@/server/use-cases/keys/borrow-keys.usecase";
import { returnKeys } from "@/server/use-cases/keys/return-keys.usecase";
import { error } from "@/server/use-cases/result";

export const borrowSchema = z.object({
  keyIds: z.array(z.string()).min(1, "鍵を1本以上選択してください"),
  reason: z
    .string()
    .min(1, "利用目的を入力してください")
    .max(500, "利用目的は500文字以内で入力してください"),
});

const confirmSchema = z.object({
  borrowingId: z.string().min(1),
});

const toValidationIssues = (zodError: z.ZodError) =>
  zodError.issues.map((e) => ({ field: e.path.join("."), message: e.message }));

export const borrowKeysApplication = async (
  input: unknown,
  headers: Headers,
) => {
  const session = await auth.api.getSession({ headers });
  if (!session) return error(new UnauthorizedError());

  const parsed = borrowSchema.safeParse(input);
  if (!parsed.success) {
    return error(new ValidationError(toValidationIssues(parsed.error)));
  }

  return borrowKeys({
    keyRepo: createKeyRepository(db),
    borrowingRepo: createBorrowingRepository(db),
  })({
    keyIds: parsed.data.keyIds,
    userId: session.user.id,
    reason: parsed.data.reason,
  });
};

export const returnKeysApplication = async (
  input: { keyIds: string[] },
  headers: Headers,
) => {
  const session = await auth.api.getSession({ headers });
  if (!session) return error(new UnauthorizedError());

  return returnKeys({
    keyRepo: createKeyRepository(db),
    borrowingRepo: createBorrowingRepository(db),
  })({ keyIds: input.keyIds, userId: session.user.id });
};

export const confirmReturnApplication = async (
  input: unknown,
  headers: Headers,
) => {
  const session = await auth.api.getSession({ headers });
  if (!session) return error(new UnauthorizedError());

  const parsed = confirmSchema.safeParse(input);
  if (!parsed.success) {
    return error(
      new ValidationError([{ field: "borrowingId", message: "借用IDが無効です" }]),
    );
  }

  return confirmReturn({ borrowingRepo: createBorrowingRepository(db) })({
    borrowingId: parsed.data.borrowingId,
    confirmedByUserId: session.user.id,
  });
};
