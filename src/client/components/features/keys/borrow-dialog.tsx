"use client";

import { useState } from "react";
import { borrowKeysAction, type KeyActionState } from "@/app/actions/keys";
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
import { Textarea } from "@/client/components/ui/textarea";
import { useActionStateWithSuccess } from "@/client/hooks/use-action-state-with-success";
import type { Key } from "@/server/domain/keys/entity";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keys: Key[];
};

const initial: KeyActionState = { errors: null, success: false };

export const BorrowDialog = ({ open, onOpenChange, keys }: Props) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [state, action, isPending] = useActionStateWithSuccess(
    borrowKeysAction,
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
          <DialogTitle>鍵を借りる</DialogTitle>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-4">
          {selectedIds.map((id) => (
            <input key={id} type="hidden" name="keyIds" value={id} />
          ))}

          <div className="flex flex-col gap-2">
            <Label>借りる鍵を選択</Label>
            <div className="flex flex-col gap-2">
              {keys.map((key) => {
                const disabled = key.status === "borrowed";
                const checked = selectedIds.includes(key.id);
                return (
                  // biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox renders as button
                  <label
                    key={key.id}
                    className={`flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer transition-colors ${
                      disabled
                        ? "opacity-50 cursor-not-allowed bg-muted"
                        : checked
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      disabled={disabled}
                      checked={checked}
                      onCheckedChange={(checked) => {
                        if (!disabled) toggle(key.id, !!checked);
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{key.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {key.id}
                      </p>
                    </div>
                    {disabled && (
                      <span className="text-xs text-muted-foreground">
                        借用中
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">
              理由 <span className="text-xs text-destructive">必須</span>
            </Label>
            <Textarea
              id="reason"
              name="reason"
              placeholder="利用目的を入力してください"
            />
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
              {isPending ? "処理中..." : "借りる"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
