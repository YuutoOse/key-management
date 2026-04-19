import type { Borrowing } from "@/server/domain/borrowings/entity";
import type { BorrowingRepository } from "@/server/domain/borrowings/repository";
import { BusinessRuleError, ValidationError } from "@/server/domain/errors";
import type { Key } from "@/server/domain/keys/entity";
import type { KeyRepository } from "@/server/domain/keys/repository";
import { error, ok, type Result } from "@/server/use-cases/result";

type ReturnKeysDeps = {
  keyRepo: KeyRepository;
  borrowingRepo: BorrowingRepository;
};

type ReturnKeysInput = {
  keyIds: string[];
  userId: string;
};

export const returnKeys =
  (deps: ReturnKeysDeps) =>
  async (input: ReturnKeysInput): Promise<Result<void>> => {
    const { keyRepo, borrowingRepo } = deps;

    if (input.keyIds.length === 0) {
      return error(
        new ValidationError([
          { field: "keyIds", message: "鍵を選択してください" },
        ]),
      );
    }

    const targets = await keyRepo.findManyByIds(input.keyIds);
    const notOwned = targets.filter(
      (key: Key) =>
        key.status !== "borrowed" || key.borrowedById !== input.userId,
    );
    if (notOwned.length > 0) {
      return error(
        new BusinessRuleError(
          "RETURN_NOT_OWNED",
          `以下の鍵はあなたが借用していません: ${notOwned.map((key: Key) => key.name).join(", ")}`,
        ),
      );
    }

    const toUpdate = await borrowingRepo.findAll({
      keyIds: input.keyIds,
      status: "borrowed",
      userId: input.userId,
    });

    if (toUpdate.length > 0) {
      const now = new Date();
      await borrowingRepo.updateMany(
        toUpdate.map((borrowing: Borrowing) => ({
          ...borrowing,
          returnedAt: now,
          status: "pending_confirm" as const,
        })),
      );
    }

    return ok(undefined);
  };
