"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { type ActionState, fromFormData } from "@/app/actions/types";
import { createUserRepository } from "@/server/infrastructure/users-repository";
import { changePassword } from "@/server/use-cases/users/change-password.usecase";

const baseSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "現在のパスワードを入力してください")
    .max(128, "パスワードは128文字以内で入力してください"),
  newPassword: z
    .string()
    .min(8, "8文字以上で入力してください")
    .max(128, "パスワードは128文字以内で入力してください"),
  confirmPassword: z
    .string()
    .min(1, "確認用パスワードを入力してください")
    .max(128, "パスワードは128文字以内で入力してください"),
});

const schema = baseSchema.refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  },
);

type State = ActionState<typeof baseSchema>;

export const changePasswordAction = async (
  _prev: State,
  formData: FormData,
): Promise<State> => {
  const raw = fromFormData(baseSchema, formData);
  const result = schema.safeParse(raw);

  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors, success: false };
  }

  const userRepo = createUserRepository(await headers());
  try {
    await changePassword({ userRepo })({
      currentPassword: result.data.currentPassword,
      newPassword: result.data.newPassword,
    });
  } catch {
    return {
      errors: null,
      message: "現在のパスワードが正しくありません。",
      success: false,
    };
  }

  return { errors: null, success: true };
};
