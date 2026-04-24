"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { ActionState } from "@/app/actions/types";
import { fromFormData } from "@/app/actions/types";
import {
  createSchema,
  createUserApplication,
  deleteSchema,
  deleteUserApplication,
  updateSchema,
  updateUserApplication,
} from "@/server/application/users/management/actions";
import { ValidationError } from "@/server/domain/errors";

type CreateState = ActionState<typeof createSchema>;
type UpdateState = ActionState<typeof updateSchema>;
type DeleteState = ActionState<typeof deleteSchema>;

const toFieldErrors = (error: ValidationError) => {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    if (!fieldErrors[issue.field]) fieldErrors[issue.field] = [];
    fieldErrors[issue.field].push(issue.message);
  }
  return fieldErrors;
};

export const createUserAction = async (
  _prev: CreateState,
  formData: FormData,
): Promise<CreateState> => {
  const raw = fromFormData(createSchema, formData);
  const result = await createUserApplication(raw, await headers());
  if (!result.ok) {
    if (result.error instanceof ValidationError) {
      return {
        values: raw,
        errors: toFieldErrors(result.error),
        success: false,
      };
    }
    return {
      values: raw,
      errors: null,
      message: result.error.message,
      success: false,
    };
  }
  revalidatePath("/admin/users");
  return { errors: null, success: true };
};

export const updateUserAction = async (
  _prev: UpdateState,
  formData: FormData,
): Promise<UpdateState> => {
  const raw = fromFormData(updateSchema, formData);
  const result = await updateUserApplication(raw, await headers());
  if (!result.ok) {
    if (result.error instanceof ValidationError) {
      return {
        values: raw,
        errors: toFieldErrors(result.error),
        success: false,
      };
    }
    return {
      values: raw,
      errors: null,
      message: result.error.message,
      success: false,
    };
  }
  revalidatePath("/admin/users");
  return { errors: null, success: true };
};

export const deleteUserAction = async (
  _prev: DeleteState,
  formData: FormData,
): Promise<DeleteState> => {
  const raw = fromFormData(deleteSchema, formData);
  const result = await deleteUserApplication(raw, await headers());
  if (!result.ok) {
    return { errors: null, message: result.error.message, success: false };
  }
  revalidatePath("/admin/users");
  return { errors: null, success: true };
};
