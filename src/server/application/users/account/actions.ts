import { z } from "zod";
import { BusinessRuleError, ValidationError } from "@/server/domain/errors";
import { createUserRepository } from "@/server/infrastructure/users-repository";
import { error, ok } from "@/server/use-cases/result";
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

export const passwordSchema = baseSchema.refine(
  (data) => data.newPassword === data.confirmPassword,
  { message: "パスワードが一致しません", path: ["confirmPassword"] },
);

export const changePasswordApplication = async (
  input: unknown,
  headers: Headers,
) => {
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return error(
      new ValidationError(
        parsed.error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      ),
    );
  }

  try {
    await changePassword({ userRepo: createUserRepository(headers) })({
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });
    return ok(undefined);
  } catch {
    return error(
      new BusinessRuleError(
        "PASSWORD_CHANGE_FAILED",
        "現在のパスワードが正しくありません。",
      ),
    );
  }
};
