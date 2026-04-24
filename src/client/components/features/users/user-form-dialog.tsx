"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import {
  createUserAction,
  deleteUserAction,
  updateUserAction,
} from "@/app/actions/users/management";
import { Alert, AlertDescription } from "@/client/components/ui/alert";
import { Button } from "@/client/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/client/components/ui/radio-group";
import type { AdminUser } from "./types";

type Mode = "add" | "edit" | "delete";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode | undefined;
  user?: AdminUser;
};

const emptyState = { errors: null, success: false } as const;

export const UserFormDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  mode,
  user,
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
  const [createState, createAction, createPending] = useActionState(
    withClose(createUserAction),
    emptyState,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    withClose(updateUserAction),
    emptyState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    withClose(deleteUserAction),
    emptyState,
  );

  const pending = createPending || updatePending || deletePending;

  const handleOpenChange = (value: boolean) => {
    if (!value && !pending) onOpenChange(value);
  };

  if (mode === undefined) return null;

  if (mode === "delete" && user) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[400px]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>利用者の削除</DialogTitle>
          </DialogHeader>
          {deleteState.message && (
            <Alert variant="destructive">
              <AlertDescription>{deleteState.message}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{user.name}</span>{" "}
            を削除しますか？この操作は元に戻せません。
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={deletePending}
            >
              キャンセル
            </Button>
            <form action={deleteAction}>
              <input type="hidden" name="userId" value={user.id} />
              <Button
                type="submit"
                variant="destructive"
                disabled={deletePending}
              >
                {deletePending && <Loader2 className="animate-spin" />}
                削除する
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const formAction = mode === "add" ? createAction : updateAction;
  const formState = mode === "add" ? createState : updateState;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[480px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "利用者を追加" : "利用者を編集"}
          </DialogTitle>
        </DialogHeader>

        {formState.message && (
          <Alert variant="destructive">
            <AlertDescription>{formState.message}</AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          {mode === "edit" && user && (
            <input type="hidden" name="userId" value={user.id} />
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              氏名 <span className="text-xs text-destructive">必須</span>
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={formState.values?.name ?? user?.name ?? ""}
              aria-invalid={!!formState.errors?.name}
              disabled={pending}
            />
            {formState.errors?.name && (
              <p className="text-xs text-destructive">
                {formState.errors.name[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">
              メールアドレス{" "}
              {mode === "add" && (
                <span className="text-xs text-destructive">必須</span>
              )}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user?.email ?? ""}
              aria-invalid={!!createState.errors?.email}
              disabled={pending || mode === "edit"}
            />
            {createState.errors?.email && (
              <p className="text-xs text-destructive">
                {createState.errors.email[0]}
              </p>
            )}
            {mode === "edit" && (
              <p className="text-xs text-muted-foreground">
                メールアドレスは変更できません。
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">
              パスワード{" "}
              <span className="text-xs text-muted-foreground font-normal">
                {mode === "edit"
                  ? "（空欄のままで変更なし）"
                  : "必須・8文字以上"}
              </span>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              disabled={pending}
            />
            {formState.errors?.password && (
              <p className="text-xs text-destructive">
                {formState.errors.password[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              役割 <span className="text-xs text-destructive">必須</span>
            </Label>
            <RadioGroup
              name="role"
              defaultValue={user?.role ?? "user"}
              className="flex flex-col gap-2"
            >
              {(
                [
                  {
                    value: "user",
                    label: "一般利用者",
                    desc: "鍵の借用・返却・返却確認ができます。",
                  },
                  {
                    value: "admin",
                    label: "管理者",
                    desc: "一般利用者の操作に加え、利用者の追加・編集・削除ができます。",
                  },
                ] as const
              ).map((opt) => (
                // biome-ignore lint/a11y/noLabelWithoutControl: Radix RadioGroupItem renders as button
                <label
                  key={opt.value}
                  className="flex items-start gap-3 rounded-md border px-3 py-3 cursor-pointer transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 hover:bg-muted/50"
                >
                  <RadioGroupItem value={opt.value} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={pending}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              保存する
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
