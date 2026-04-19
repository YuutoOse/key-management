"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { createBorrowingRepository } from "@/server/infrastructure/db/borrowings-repository";
import { createKeyRepository } from "@/server/infrastructure/db/keys-repository";
import { auth } from "@/server/lib/auth";
import { db } from "@/server/lib/db";
import { confirmReturn } from "@/server/use-cases/borrowings/confirm-return.usecase";
import { borrowKeys } from "@/server/use-cases/keys/borrow-keys.usecase";
import { returnKeys } from "@/server/use-cases/keys/return-keys.usecase";

export type KeyActionState = {
  errors: string[] | null;
  message?: string;
  success: boolean;
};

const borrowSchema = z.object({
  reason: z
    .string()
    .min(1, "利用目的を入力してください")
    .max(500, "利用目的は500文字以内で入力してください"),
});

const confirmSchema = z.object({
  borrowingId: z.string().min(1),
});

const makeDeps = () => ({
  keyRepo: createKeyRepository(db),
  borrowingRepo: createBorrowingRepository(db),
});

const getSession = async () =>
  auth.api.getSession({ headers: await headers() });

export const borrowKeysAction = async (
  _prev: KeyActionState,
  formData: FormData,
): Promise<KeyActionState> => {
  const session = await getSession();
  if (!session) return { errors: ["認証が必要です"], success: false };

  const keyIds = formData.getAll("keyIds").map(String);
  const parsed = borrowSchema.safeParse({ reason: formData.get("reason") });
  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors.reason ?? [],
      success: false,
    };
  }
  if (keyIds.length === 0) {
    return { errors: ["鍵を1本以上選択してください"], success: false };
  }

  const result = await borrowKeys(makeDeps())({
    keyIds,
    userId: session.user.id,
    reason: parsed.data.reason,
  });

  if (!result.ok) {
    return { errors: [result.error.message], success: false };
  }

  revalidatePath("/");
  return { errors: null, success: true };
};

export const returnKeysAction = async (
  _prev: KeyActionState,
  formData: FormData,
): Promise<KeyActionState> => {
  const session = await getSession();
  if (!session) return { errors: ["認証が必要です"], success: false };

  const keyIds = formData.getAll("keyIds").map(String);
  if (keyIds.length === 0) {
    return { errors: ["鍵を1本以上選択してください"], success: false };
  }

  const result = await returnKeys(makeDeps())({
    keyIds,
    userId: session.user.id,
  });

  if (!result.ok) {
    return { errors: [result.error.message], success: false };
  }

  revalidatePath("/");
  return { errors: null, success: true };
};

export const confirmReturnAction = async (
  _prev: KeyActionState,
  formData: FormData,
): Promise<KeyActionState> => {
  const session = await getSession();
  if (!session) return { errors: ["認証が必要です"], success: false };

  const parsed = confirmSchema.safeParse({
    borrowingId: formData.get("borrowingId"),
  });
  if (!parsed.success) {
    return { errors: ["借用IDが無効です"], success: false };
  }

  const { borrowingRepo } = makeDeps();
  const result = await confirmReturn({ borrowingRepo })({
    borrowingId: parsed.data.borrowingId,
    confirmedByUserId: session.user.id,
  });

  if (!result.ok) {
    return { errors: [result.error.message], success: false };
  }

  revalidatePath("/");
  return { errors: null, success: true };
};
