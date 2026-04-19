"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { Alert, AlertDescription } from "@/client/components/ui/alert";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { loginAction } from "./actions";

const initialState = { errors: null, success: false } as const;

const LoginPage = () => {
  const [formState, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/40">
      <div className="w-full max-w-[420px] bg-background rounded-xl shadow-md px-8 py-10">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-foreground">
            鍵貸与管理システム
          </h1>
        </div>

        {formState.message && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{formState.message}</AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">ユーザーID</Label>
            <Input
              id="email"
              name="email"
              placeholder="例: admin@example.com"
              defaultValue={formState.values?.email ?? ""}
              aria-invalid={!!formState.errors?.email}
              disabled={pending}
            />
            {formState.errors?.email && (
              <p className="text-xs text-destructive">
                {formState.errors.email[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              name="password"
              type="password"
              aria-invalid={!!formState.errors?.password}
              disabled={pending}
            />
            {formState.errors?.password && (
              <p className="text-xs text-destructive">
                {formState.errors.password[0]}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full mt-3"
            size="lg"
            disabled={pending}
          >
            {pending && <Loader2 className="animate-spin" />}
            ログイン
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          パスワードをお忘れの場合は
          <br />
          管理者にご連絡ください
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
