import { z } from "zod";
import {
  BusinessRuleError,
  ForbiddenError,
  ValidationError,
} from "@/server/domain/errors";
import { createUserRepository } from "@/server/infrastructure/users-repository";
import { auth } from "@/server/lib/auth";
import { error, ok } from "@/server/use-cases/result";
import { createUser } from "@/server/use-cases/users/create-user.usecase";
import { deleteUser } from "@/server/use-cases/users/delete-user.usecase";
import { updateUser } from "@/server/use-cases/users/update-user.usecase";

export const createSchema = z.object({
  name: z
    .string()
    .min(1, "氏名を入力してください")
    .max(100, "氏名は100文字以内で入力してください"),
  email: z
    .string()
    .email("有効なメールアドレスを入力してください")
    .max(254, "メールアドレスが長すぎます"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください")
    .max(128, "パスワードは128文字以内で入力してください"),
  role: z.enum(["admin", "user"]),
});

export const updateSchema = z.object({
  userId: z.string().min(1),
  name: z
    .string()
    .min(1, "氏名を入力してください")
    .max(100, "氏名は100文字以内で入力してください"),
  role: z.enum(["admin", "user"]),
  password: z.preprocess(
    (value: unknown) => (value === "" ? undefined : value),
    z
      .string()
      .min(8, "パスワードは8文字以上で入力してください")
      .max(128, "パスワードは128文字以内で入力してください")
      .optional(),
  ),
});

export const deleteSchema = z.object({ userId: z.string().min(1) });

const requireAdmin = async (headers: Headers) => {
  const session = await auth.api.getSession({ headers });
  if (!session || session.user.role !== "admin") {
    return error(new ForbiddenError());
  }
  return null;
};

const toValidationError = (zodError: z.ZodError) =>
  new ValidationError(
    zodError.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })),
  );

export const createUserApplication = async (
  input: unknown,
  headers: Headers,
) => {
  const authError = await requireAdmin(headers);
  if (authError) return authError;

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return error(toValidationError(parsed.error));

  try {
    await createUser({ userRepo: createUserRepository(headers) })(parsed.data);
    return ok(undefined);
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "ユーザーの作成に失敗しました。";
    return error(new BusinessRuleError("USER_CREATE_FAILED", msg));
  }
};

export const updateUserApplication = async (
  input: unknown,
  headers: Headers,
) => {
  const authError = await requireAdmin(headers);
  if (authError) return authError;

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return error(toValidationError(parsed.error));

  try {
    await updateUser({ userRepo: createUserRepository(headers) })(parsed.data);
    return ok(undefined);
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "ユーザーの更新に失敗しました。";
    return error(new BusinessRuleError("USER_UPDATE_FAILED", msg));
  }
};

export const deleteUserApplication = async (
  input: unknown,
  headers: Headers,
) => {
  const authError = await requireAdmin(headers);
  if (authError) return authError;

  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) {
    return error(
      new BusinessRuleError("INVALID_USER_ID", "ユーザーIDが不正です。"),
    );
  }

  try {
    await deleteUser({ userRepo: createUserRepository(headers) })(
      parsed.data.userId,
    );
    return ok(undefined);
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "ユーザーの削除に失敗しました。";
    return error(new BusinessRuleError("USER_DELETE_FAILED", msg));
  }
};
