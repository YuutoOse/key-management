"use client";

import {
  confirmReturnAction,
  type KeyActionState,
} from "@/app/actions/borrowings";
import { Button } from "@/client/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog";
import { useActionStateWithSuccess } from "@/client/hooks/use-action-state-with-success";
import { formatDateTime } from "@/client/lib/date";
import type { Borrowing } from "@/server/domain/borrowings/entity";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  borrowing: Borrowing | null;
};

const initial: KeyActionState = { errors: null, success: false };

export const ConfirmReturnDialog = ({
  open,
  onOpenChange,
  borrowing,
}: Props) => {
  const [state, action, isPending] = useActionStateWithSuccess(
    confirmReturnAction,
    initial,
    () => onOpenChange(false),
  );

  if (!borrowing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>返却確認</DialogTitle>
        </DialogHeader>

        <div className="rounded-md border divide-y text-sm">
          <Row label="鍵" value={borrowing.keyName} />
          <Row label="利用者" value={borrowing.userName} />
          <Row
            label="借用日時"
            value={formatDateTime(borrowing.borrowedAt)}
            mono
          />
          <Row
            label="返却日時"
            value={
              borrowing.returnedAt ? formatDateTime(borrowing.returnedAt) : "—"
            }
            mono
          />
          <Row label="理由" value={borrowing.reason} />
        </div>

        {state.errors && state.errors.length > 0 && (
          <p className="text-xs text-destructive">{state.errors.join(" / ")}</p>
        )}

        <form action={action}>
          <input type="hidden" name="borrowingId" value={borrowing.id} />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "処理中..." : "確認する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

type RowProps = {
  label: string;
  value: string;
  mono?: boolean;
};
const Row = ({ label, value, mono }: RowProps) => {
  return (
    <div className="flex gap-4 px-3 py-2">
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
      <span className={mono ? "font-mono tabular-nums" : ""}>{value}</span>
    </div>
  );
};
