import type { z } from "zod";

export type FlatActionState = {
  errors: string[] | null;
  message?: string;
  success: boolean;
};

export type ActionState<S extends z.ZodObject<z.ZodRawShape>> = {
  values?: Partial<{ [K in keyof z.infer<S>]: string }>;
  errors: null | { [K in keyof z.infer<S>]?: string[] };
  message?: string;
  success: boolean;
};

export const fromFormData = <S extends z.ZodObject<z.ZodRawShape>>(
  schema: S,
  formData: FormData,
): { [K in keyof z.infer<S>]: string } =>
  Object.fromEntries(
    Object.keys(schema.shape).map((key) => [
      key,
      String(formData.get(key) ?? ""),
    ]),
  ) as { [K in keyof z.infer<S>]: string };
