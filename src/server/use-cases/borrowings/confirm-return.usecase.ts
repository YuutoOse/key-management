import type { BorrowingRepository } from "@/server/domain/borrowings/repository";
import {
  BusinessRuleError,
  ForbiddenError,
  NotFoundError,
} from "@/server/domain/errors";
import { error, ok, type Result } from "@/server/use-cases/result";

type ConfirmReturnDeps = {
  borrowingRepo: BorrowingRepository;
};

type ConfirmReturnInput = {
  borrowingId: string;
  confirmedByUserId: string;
};

export const confirmReturn =
  (deps: ConfirmReturnDeps) =>
  async (input: ConfirmReturnInput): Promise<Result<void>> => {
    const { borrowingRepo } = deps;

    const borrowing = await borrowingRepo.findById(input.borrowingId);
    if (!borrowing) {
      return error(new NotFoundError("借用記録"));
    }
    if (borrowing.status !== "pending_confirm") {
      return error(
        new BusinessRuleError(
          "CONFIRM_INVALID_STATUS",
          "返却確認待ち状態ではありません",
        ),
      );
    }
    if (borrowing.userId === input.confirmedByUserId) {
      return error(new ForbiddenError());
    }

    await borrowingRepo.updateMany([
      {
        ...borrowing,
        status: "completed",
        confirmedAt: new Date(),
        confirmedBy: input.confirmedByUserId,
      },
    ]);

    return ok(undefined);
  };
