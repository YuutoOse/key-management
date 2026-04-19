"use client";

import { KeyRound, RotateCcw } from "lucide-react";
import { useState } from "react";
import { BorrowDialog } from "@/client/components/features/keys/borrow-dialog";
import { ConfirmReturnDialog } from "@/client/components/features/keys/confirm-return-dialog";
import { HistoryTable } from "@/client/components/features/keys/history-table";
import { KeyCard } from "@/client/components/features/keys/key-card";
import { ReturnDialog } from "@/client/components/features/keys/return-dialog";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import type { Borrowing } from "@/server/domain/borrowings/entity";
import type { Key } from "@/server/domain/keys/entity";

type Props = {
  keys: Key[];
  borrowings: Borrowing[];
  currentUserId: string;
  keyFilter: string;
  statusFilter: string;
};

export const KeysDashboard: React.FC<Props> = ({
  keys,
  borrowings,
  currentUserId,
  keyFilter,
  statusFilter,
}: Props) => {
  const [borrowOpen, setBorrowOpen] = useState<boolean>(false);
  const [returnOpen, setReturnOpen] = useState<boolean>(false);
  const [confirmBorrowing, setConfirmBorrowing] = useState<Borrowing | null>(
    null,
  );

  const myBorrowedKeys = keys.filter(
    (key) => key.status === "borrowed" && key.borrowedById === currentUserId,
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold">鍵の借用</h1>
          <div className="flex gap-2">
            {myBorrowedKeys.length > 0 && (
              <Button variant="outline" onClick={() => setReturnOpen(true)}>
                <RotateCcw />
                鍵を返す
                <Badge variant="secondary" className="ml-1">
                  {myBorrowedKeys.length}本
                </Badge>
              </Button>
            )}
            <Button onClick={() => setBorrowOpen(true)}>
              <KeyRound />
              鍵を借りる
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {keys.map((key) => (
            <KeyCard key={key.id} keyData={key} />
          ))}
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3">借用履歴</h2>
          <HistoryTable
            borrowings={borrowings}
            keys={keys}
            currentUserId={currentUserId}
            keyFilter={keyFilter}
            statusFilter={statusFilter}
            onConfirmReturn={setConfirmBorrowing}
          />
        </div>
      </div>

      <BorrowDialog
        open={borrowOpen}
        onOpenChange={setBorrowOpen}
        keys={keys}
      />
      <ReturnDialog
        open={returnOpen}
        onOpenChange={setReturnOpen}
        borrowedKeys={myBorrowedKeys}
      />
      <ConfirmReturnDialog
        open={!!confirmBorrowing}
        onOpenChange={(value) => {
          if (!value) setConfirmBorrowing(null);
        }}
        borrowing={confirmBorrowing}
      />
    </>
  );
};
