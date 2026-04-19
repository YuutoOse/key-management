"use client";

import { ChevronDown, KeyRound, Lock, LogOut, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PasswordChangeDialog } from "@/client/components/features/password/password-change-dialog";
import { Button } from "@/client/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { authClient } from "@/client/lib/auth";

type Props = {
  userName: string;
  userRole: "admin" | "user";
};

export const Topbar = ({ userName, userRole }: Props) => {
  const router = useRouter();
  const [passwordOpen, setPasswordOpen] = useState(false);

  const initials = userName
    .split(" ")
    .map((names) => names[0])
    .join("")
    .slice(0, 2);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <>
      <header className="h-14 bg-background border-b flex items-center px-6 gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-base">
          <KeyRound className="size-4" />
          鍵貸与管理
        </Link>

        <div className="flex-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <span className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                {initials}
              </span>
              <span className="text-sm font-medium">{userName}</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px]">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{userName}</span>
              <span className="text-xs text-muted-foreground font-normal">
                {userRole === "admin" ? "管理者" : "一般利用者"}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {userRole === "admin" && (
              <DropdownMenuItem asChild>
                <Link href="/admin/users" className="flex items-center gap-2">
                  <Users className="size-4" />
                  利用者管理
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="flex items-center gap-2"
              onSelect={() => setPasswordOpen(true)}
            >
              <Lock className="size-4" />
              パスワード変更
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-destructive focus:text-destructive"
              onSelect={handleLogout}
            >
              <LogOut className="size-4" />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <PasswordChangeDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
      />
    </>
  );
};
