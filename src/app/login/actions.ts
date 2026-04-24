"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { type ActionState, fromFormData } from "@/app/actions/types";
import { auth } from "@/server/lib/auth";

const schema = z.object({
  email: z.string().min(1, "ユーザーIDを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

type State = ActionState<typeof schema>;

export const loginAction = async (
  _prev: State,
  formData: FormData,
): Promise<State> => {
  const raw = fromFormData(schema, formData);
  const result = schema.safeParse(raw);

  if (!result.success) {
    return {
      values: { email: raw.email },
      errors: z.flattenError(result.error).fieldErrors,
      success: false,
    };
  }

  try {
    await auth.api.signInEmail({
      body: result.data,
      headers: await headers(),
    });
  } catch {
    return {
      values: { email: raw.email },
      errors: null,
      message: "ユーザーIDまたはパスワードが正しくありません。",
      success: false,
    };
  }

  redirect("/");
};
