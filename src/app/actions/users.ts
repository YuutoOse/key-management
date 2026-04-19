"use server";

import { revalidatePath } from "next/cache";
import { headers as nextHeaders } from "next/headers";
import { z } from "zod";
import { type ActionState, fromFormData } from "@/app/actions/types";
import { createUserRepository } from "@/server/infrastructure/users-repository";
import { auth } from "@/server/lib/auth";
import { createUser } from "@/server/use-cases/users/create-user.usecase";
import { deleteUser } from "@/server/use-cases/users/delete-user.usecase";
import { updateUser } from "@/server/use-cases/users/update-user.usecase";

const createSchema = z.object({
  name: z
    .string()
    .min(1, "氏名を入力してください")
    .max(100, "氏名は100文字以内で入力してください"),
  email: z
    .email("有効なメールアドレスを入力してください")
    .max(254, "メールアドレスが長すぎます"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください")
    .max(128, "パスワードは128文字以内で入力してください"),
  role: z.enum(["admin", "user"]),
});

const updateSchema = z.object({
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

const deleteSchema = z.object({ userId: z.string().min(1) });

type CreateState = ActionState<typeof createSchema>;
type UpdateState = ActionState<typeof updateSchema>;
type DeleteState = ActionState<typeof deleteSchema>;

const requireAdmin = async () => {
  const session = await auth.api.getSession({ headers: await nextHeaders() });
  if (!session || session.user.role !== "admin") {
    return {
      errors: null,
      message: "管理者権限が必要です",
      success: false,
    } as const;
  }
  return null;
};

const makeDeps = async () => ({
  userRepo: createUserRepository(await nextHeaders()),
});

export const createUserAction = async (
  _prev: CreateState,
  formData: FormData,
): Promise<CreateState> => {
  const authError = await requireAdmin();
  if (authError) return authError;

  const raw = fromFormData(createSchema, formData);
  const result = createSchema.safeParse(raw);
  if (!result.success) {
    return {
      values: raw,
      errors: z.flattenError(result.error).fieldErrors,
      success: false,
    };
  }

  try {
    await createUser(await makeDeps())(result.data);
  } catch (e: unknown) {
    console.error("[createUserAction]", e);
    const msg =
      e instanceof Error ? e.message : "ユーザーの作成に失敗しました。";
    return { values: raw, errors: null, message: msg, success: false };
  }

  revalidatePath("/admin/users");
  return { errors: null, success: true };
};

export const updateUserAction = async (
  _prev: UpdateState,
  formData: FormData,
): Promise<UpdateState> => {
  const authError = await requireAdmin();
  if (authError) return authError;

  const raw = fromFormData(updateSchema, formData);
  const result = updateSchema.safeParse(raw);
  if (!result.success) {
    return {
      values: raw,
      errors: z.flattenError(result.error).fieldErrors,
      success: false,
    };
  }

  try {
    await updateUser(await makeDeps())(result.data);
  } catch (e: unknown) {
    console.error("[updateUserAction]", e);
    const msg =
      e instanceof Error ? e.message : "ユーザーの更新に失敗しました。";
    return { values: raw, errors: null, message: msg, success: false };
  }

  revalidatePath("/admin/users");
  return { errors: null, success: true };
};

export const deleteUserAction = async (
  _prev: DeleteState,
  formData: FormData,
): Promise<DeleteState> => {
  const authError = await requireAdmin();
  if (authError) return authError;

  const raw = fromFormData(deleteSchema, formData);
  const result = deleteSchema.safeParse(raw);
  if (!result.success) {
    return { errors: null, message: "ユーザーIDが不正です。", success: false };
  }

  try {
    await deleteUser(await makeDeps())(result.data.userId);
  } catch (e: unknown) {
    console.error("[deleteUserAction]", e);
    const msg =
      e instanceof Error ? e.message : "ユーザーの削除に失敗しました。";
    return { errors: null, message: msg, success: false };
  }

  revalidatePath("/admin/users");
  return { errors: null, success: true };
};
