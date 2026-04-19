import type { DomainError } from "@/server/domain/errors";

export type Result<T, E extends DomainError = DomainError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });

export const error = <E extends DomainError>(error: E): Result<never, E> => ({
  ok: false,
  error,
});
