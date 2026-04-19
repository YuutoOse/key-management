"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { AdminUser } from "@/client/components/features/users/types";
import { UserFormDialog } from "@/client/components/features/users/user-form-dialog";
import { UserTable } from "@/client/components/features/users/user-table";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";

type DialogState =
  | { open: false }
  | { open: true; mode: "add" }
  | { open: true; mode: "edit" | "delete"; user: AdminUser };

type Props = {
  users: AdminUser[];
};

export const UserManagement: React.FC<Props> = ({ users }: Props) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dialog, setDialog] = useState<DialogState>({ open: false });

  const filtered = useMemo(() => {
    return users.filter((user: AdminUser) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (search) {
        const searchString = search.toLowerCase();
        if (
          !user.name.toLowerCase().includes(searchString) &&
          !user.email.toLowerCase().includes(searchString)
        )
          return false;
      }
      return true;
    });
  }, [users, roleFilter, search]);

  const dialogUser =
    dialog.open && dialog.mode !== "add" ? dialog.user : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">利用者管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            本システムを利用するユーザーを登録・編集します。
          </p>
        </div>
        <Button onClick={() => setDialog({ open: true, mode: "add" })}>
          <Plus />
          利用者を追加
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="名前・メールで検索"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-[260px]"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="すべての役割" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">すべての役割</SelectItem>
              <SelectItem value="admin">管理者</SelectItem>
              <SelectItem value="user">一般利用者</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length}件
        </span>
      </div>

      <UserTable
        users={filtered}
        onEdit={(user: AdminUser) =>
          setDialog({ open: true, mode: "edit", user })
        }
        onDelete={(user: AdminUser) =>
          setDialog({ open: true, mode: "delete", user })
        }
      />

      <UserFormDialog
        open={dialog.open}
        onOpenChange={(value: boolean) => {
          if (!value) setDialog({ open: false });
        }}
        mode={dialog.open ? dialog.mode : undefined}
        user={dialogUser}
      />
    </div>
  );
};
