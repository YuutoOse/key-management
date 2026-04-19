"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { changePasswordAction } from "@/app/actions/password";
import { Alert, AlertDescription } from "@/client/components/ui/alert";
import { Button } from "@/client/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";

const initialState = { errors: null, success: false } as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const PasswordChangeDialog: React.FC<Props> = ({
  open,
  onOpenChange,
}: Props) => {
  const withClose = <State extends { success: boolean }, Payload>(
    action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
  ): ((state: Awaited<State>, payload: Payload) => Promise<State>) => {
    return async (state: Awaited<State>, payload: Payload): Promise<State> => {
      const result = action(state, payload);
      if (result instanceof Promise && (await result).success) {
        onOpenChange(false);
      }
      return result;
    };
  };
  const [formState, formAction, pending] = useActionState(
    withClose(changePasswordAction),
    initialState,
  );

  const handleOpenChange = (value: boolean) => {
    if (!value && !pending) onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[480px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>パスワード変更</DialogTitle>
        </DialogHeader>

        {formState.message && (
          <Alert variant="destructive">
            <AlertDescription>{formState.message}</AlertDescription>
          </Alert>
        )}
        {formState.success && (
          <Alert>
            <AlertDescription>パスワードを変更しました。</AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentPassword">
              現在のパスワード{" "}
              <span className="text-xs text-destructive">必須</span>
            </Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              aria-invalid={!!formState.errors?.currentPassword}
              disabled={pending || formState.success}
            />
            {formState.errors?.currentPassword && (
              <p className="text-xs text-destructive">
                {formState.errors.currentPassword[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="newPassword">
              新しいパスワード{" "}
              <span className="text-xs text-destructive">必須</span>
            </Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              aria-invalid={!!formState.errors?.newPassword}
              disabled={pending || formState.success}
            />
            {formState.errors?.newPassword && (
              <p className="text-xs text-destructive">
                {formState.errors.newPassword[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">
              新しいパスワード（確認）{" "}
              <span className="text-xs text-destructive">必須</span>
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              aria-invalid={!!formState.errors?.confirmPassword}
              disabled={pending || formState.success}
            />
            {formState.errors?.confirmPassword && (
              <p className="text-xs text-destructive">
                {formState.errors.confirmPassword[0]}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={pending}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={pending || formState.success}>
              {pending && <Loader2 className="animate-spin" />}
              変更する
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
