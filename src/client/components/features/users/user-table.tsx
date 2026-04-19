import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";
import { formatDate } from "@/client/lib/date";
import type { AdminUser } from "./types";

type AvatarProps = { name: string };
const Avatar: React.FC<AvatarProps> = ({ name }) => {
  const initials = name
    .split(" ")
    .map((names) => names[0])
    .join("")
    .slice(0, 2);
  return (
    <span className="size-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground shrink-0">
      {initials}
    </span>
  );
};

type Props = {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
};

export const UserTable: React.FC<Props> = ({
  users,
  onEdit,
  onDelete,
}: Props) => {
  return (
    <div className="rounded-lg border bg-background overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>利用者</TableHead>
            <TableHead>メールアドレス</TableHead>
            <TableHead>役割</TableHead>
            <TableHead>登録日</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground py-8"
              >
                該当する利用者がいません
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "info" : "secondary"}>
                    {user.role === "admin" ? "管理者" : "一般利用者"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(user)}
                    >
                      編集
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(user)}
                    >
                      削除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
