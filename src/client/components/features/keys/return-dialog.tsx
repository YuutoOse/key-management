"use client";

import { useState } from "react";
import { type KeyActionState, returnKeysAction } from "@/app/actions/borrowings";
import { Button } from "@/client/components/ui/button";
import { Checkbox } from "@/client/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog";
import { Label } from "@/client/components/ui/label";
import { useActionStateWithSuccess } from "@/client/hooks/use-action-state-with-success";
import type { Key } from "@/server/domain/keys/entity";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  borrowedKeys: Key[];
};

const initial: KeyActionState = { errors: null, success: false };

export const ReturnDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  borrowedKeys,
}: Props) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [state, action, isPending] = useActionStateWithSuccess(
    returnKeysAction,
    initial,
    () => {
      setSelectedIds([]);
      onOpenChange(false);
    },
  );

  const handleOpenChange = (value: boolean) => {
    if (!value) setSelectedIds([]);
    onOpenChange(value);
  };

  const toggle = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[480px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>鍵を返す</DialogTitle>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-4">
          {selectedIds.map((id) => (
            <input key={id} type="hidden" name="keyIds" value={id} />
          ))}

          <div className="flex flex-col gap-2">
            <Label>返却する鍵を選択</Label>
            <div className="flex flex-col gap-2">
              {borrowedKeys.map((borrowedKey) => {
                const checked = selectedIds.includes(borrowedKey.id);
                return (
                  // biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox renders as button
                  <label
                    key={borrowedKey.id}
                    className={`flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer transition-colors ${
                      checked
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(checked) =>
                        toggle(borrowedKey.id, !!checked)
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{borrowedKey.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {borrowedKey.id}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {state.errors && state.errors.length > 0 && (
            <p className="text-xs text-destructive">
              {state.errors.join(" / ")}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "処理中..." : "返却"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
