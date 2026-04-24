"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { FlatActionState } from "@/app/actions/types";
import {
  borrowKeysApplication,
  confirmReturnApplication,
  returnKeysApplication,
} from "@/server/application/borrowings/actions";
import { ValidationError } from "@/server/domain/errors";

export type { FlatActionState as KeyActionState };

export const borrowKeysAction = async (
  _prev: FlatActionState,
  formData: FormData,
): Promise<FlatActionState> => {
  const keyIds = formData.getAll("keyIds").map(String);
  const result = await borrowKeysApplication(
    { keyIds, reason: formData.get("reason") },
    await headers(),
  );
  if (!result.ok) {
    const messages =
      result.error instanceof ValidationError
        ? result.error.issues.map((i) => i.message)
        : [result.error.message];
    return { errors: messages, success: false };
  }
  revalidatePath("/");
  return { errors: null, success: true };
};

export const returnKeysAction = async (
  _prev: FlatActionState,
  formData: FormData,
): Promise<FlatActionState> => {
  const keyIds = formData.getAll("keyIds").map(String);
  const result = await returnKeysApplication({ keyIds }, await headers());
  if (!result.ok) {
    const messages =
      result.error instanceof ValidationError
        ? result.error.issues.map((i) => i.message)
        : [result.error.message];
    return { errors: messages, success: false };
  }
  revalidatePath("/");
  return { errors: null, success: true };
};

export const confirmReturnAction = async (
  _prev: FlatActionState,
  formData: FormData,
): Promise<FlatActionState> => {
  const result = await confirmReturnApplication(
    { borrowingId: formData.get("borrowingId") },
    await headers(),
  );
  if (!result.ok) {
    const messages =
      result.error instanceof ValidationError
        ? result.error.issues.map((i) => i.message)
        : [result.error.message];
    return { errors: messages, success: false };
  }
  revalidatePath("/");
  return { errors: null, success: true };
};
