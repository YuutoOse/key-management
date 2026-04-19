"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";
import { formatDate, formatTime } from "@/client/lib/date";
import type {
  Borrowing,
  BorrowingStatus,
} from "@/server/domain/borrowings/entity";
import type { Key } from "@/server/domain/keys/entity";

type DateCellProps = {
  date?: Date;
};
const DateCell: React.FC<DateCellProps> = ({ date }: DateCellProps) => {
  if (!date) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-col font-mono tabular-nums text-xs">
      <span className="text-muted-foreground">{formatDate(date)}</span>
      <span>{formatTime(date)}</span>
    </div>
  );
};

type StatusBadgeProps = {
  status: BorrowingStatus;
};
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
}: StatusBadgeProps) => {
  if (status === "completed") return <Badge variant="success">完了</Badge>;
  if (status === "pending_confirm")
    return <Badge variant="info">返却確認待ち</Badge>;
  return <Badge variant="warning">借用中</Badge>;
};

type Props = {
  borrowings: Borrowing[];
  keys: Key[];
  currentUserId: string;
  keyFilter: string;
  statusFilter: string;
  onConfirmReturn: (borrowing: Borrowing) => void;
};

export const HistoryTable: React.FC<Props> = ({
  borrowings,
  keys,
  currentUserId,
  keyFilter,
  statusFilter,
  onConfirmReturn,
}: Props) => {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const setKeyFilter = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value === "all") params.delete("keyId");
    else params.set("keyId", value);
    params.delete("status");
    router.replace(`?${params.toString()}`);
  };

  const setStatusFilter = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value === "all") params.delete("status");
    else params.set("status", value);
    router.replace(`?${params.toString()}`);
  };

  const filteredBorrowings = useMemo(() => {
    if (!search) return borrowings;
    const searchString = search.toLowerCase();
    return borrowings.filter(
      (b: Borrowing) =>
        b.userName.toLowerCase().includes(searchString) ||
        b.reason.toLowerCase().includes(searchString),
    );
  }, [borrowings, search]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="利用者名・理由で検索"
          value={search}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(event.target.value)
          }
          className="max-w-[260px]"
        />
        <Select value={keyFilter} onValueChange={setKeyFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="すべての鍵" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての鍵</SelectItem>
            {keys.map((key) => (
              <SelectItem key={key.id} value={key.id}>
                {key.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="すべての状態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての状態</SelectItem>
            <SelectItem value="borrowed">借用中</SelectItem>
            <SelectItem value="pending_confirm">返却確認待ち</SelectItem>
            <SelectItem value="completed">完了</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          {filteredBorrowings.length}件
        </span>
      </div>

      <div className="rounded-lg border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>鍵</TableHead>
              <TableHead>利用者</TableHead>
              <TableHead>借用</TableHead>
              <TableHead>返却</TableHead>
              <TableHead>返却確認者</TableHead>
              <TableHead>理由</TableHead>
              <TableHead>状態</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBorrowings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-8"
                >
                  該当する履歴がありません
                </TableCell>
              </TableRow>
            ) : (
              filteredBorrowings.map((borrowing) => {
                const canConfirm =
                  borrowing.status === "pending_confirm" &&
                  borrowing.userId !== currentUserId;
                return (
                  <TableRow key={borrowing.id}>
                    <TableCell className="font-medium">
                      {borrowing.keyName}
                    </TableCell>
                    <TableCell>{borrowing.userName}</TableCell>
                    <TableCell>
                      <DateCell date={borrowing.borrowedAt} />
                    </TableCell>
                    <TableCell>
                      <DateCell date={borrowing.returnedAt} />
                    </TableCell>
                    <TableCell>
                      {borrowing.confirmedBy ? (
                        <div className="flex items-center gap-1">
                          <span className="text-sm">
                            {borrowing.confirmedByName ?? borrowing.confirmedBy}
                          </span>
                          {borrowing.autoConfirmed && (
                            <Badge variant="secondary" className="text-xs">
                              自動
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[160px]">
                      <span className="text-sm truncate block">
                        {borrowing.reason}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={borrowing.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {canConfirm && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onConfirmReturn(borrowing)}
                        >
                          返却確認
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
