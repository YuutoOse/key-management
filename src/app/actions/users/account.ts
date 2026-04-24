"use server";

import { headers } from "next/headers";
import { type ActionState, fromFormData } from "@/app/actions/types";
import {
  changePasswordApplication,
  passwordSchema,
} from "@/server/application/users/account/actions";
import { ValidationError } from "@/server/domain/errors";

type State = ActionState<typeof passwordSchema>;

const toFieldErrors = (error: ValidationError) => {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    if (!fieldErrors[issue.field]) fieldErrors[issue.field] = [];
    fieldErrors[issue.field].push(issue.message);
  }
  return fieldErrors;
};

export const changePasswordAction = async (
  _prev: State,
  formData: FormData,
): Promise<State> => {
  const raw = fromFormData(passwordSchema, formData);
  const result = await changePasswordApplication(raw, await headers());
  if (!result.ok) {
    if (result.error instanceof ValidationError) {
      return { errors: toFieldErrors(result.error), success: false };
    }
    return { errors: null, message: result.error.message, success: false };
  }
  return { errors: null, success: true };
};
