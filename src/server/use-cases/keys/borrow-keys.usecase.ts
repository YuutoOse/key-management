import type { Borrowing } from "@/server/domain/borrowings/entity";
import type { BorrowingRepository } from "@/server/domain/borrowings/repository";
import { BusinessRuleError, ValidationError } from "@/server/domain/errors";
import type { Key } from "@/server/domain/keys/entity";
import type { KeyRepository } from "@/server/domain/keys/repository";
import { error, ok, type Result } from "@/server/use-cases/result";

type BorrowKeysDeps = {
  keyRepo: KeyRepository;
  borrowingRepo: BorrowingRepository;
};

type BorrowKeysInput = {
  keyIds: string[];
  userId: string;
  reason: string;
};

export const borrowKeys =
  (deps: BorrowKeysDeps) =>
  async (input: BorrowKeysInput): Promise<Result<void>> => {
    const { keyRepo, borrowingRepo } = deps;

    if (input.keyIds.length === 0) {
      return error(
        new ValidationError([
          { field: "keyIds", message: "鍵を選択してください" },
        ]),
      );
    }
    if (!input.reason.trim()) {
      return error(
        new ValidationError([
          { field: "reason", message: "利用目的を入力してください" },
        ]),
      );
    }

    const targets = await keyRepo.findManyByIds(input.keyIds);
    const unavailable = targets.filter(
      (key: Key) => key.status !== "available",
    );
    if (unavailable.length > 0) {
      return error(
        new BusinessRuleError(
          "BORROW_UNAVAILABLE",
          `以下の鍵は貸出中です: ${unavailable.map((key: Key) => key.name).join(", ")}`,
        ),
      );
    }

    const now = new Date();

    const pendingBorrowings = await borrowingRepo.findAll({
      keyIds: input.keyIds,
      status: "pending_confirm",
    });

    await borrowingRepo.createManyWithAutoConfirm(
      targets.map((key: Key) => ({
        keyId: key.id,
        userId: input.userId,
        borrowedAt: now,
        reason: input.reason.trim(),
        status: "borrowed" as const,
      })),
      pendingBorrowings.map((borrowing: Borrowing) => ({
        ...borrowing,
        status: "completed" as const,
        confirmedAt: now,
        autoConfirmed: true,
        confirmedBy: input.userId,
      })),
    );

    return ok(undefined);
  };
