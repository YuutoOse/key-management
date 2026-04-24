import { headers } from "next/headers";
import { queryBorrowings } from "@/app/queries/borrowings";
import { queryKeys } from "@/app/queries/keys";
import { KeysDashboard } from "@/client/components/features/keys/keys-dashboard";
import { PageShell } from "@/client/components/layout/page-shell";
import type { BorrowingStatus } from "@/server/domain/borrowings/entity";
import { auth } from "@/server/lib/auth";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const MainPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const [session, params] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    searchParams,
  ]);

  const userRole = session?.user.role === "admin" ? "admin" : "user";
  const keyId = typeof params.keyId === "string" ? params.keyId : undefined;
  const status =
    typeof params.status === "string"
      ? (params.status as BorrowingStatus)
      : undefined;

  const [keys, borrowings] = await Promise.all([
    queryKeys(),
    queryBorrowings({ keyId, status }),
  ]);

  return (
    <PageShell userName={session?.user.name ?? ""} userRole={userRole}>
      <KeysDashboard
        keys={keys}
        borrowings={borrowings}
        currentUserId={session?.user.id ?? ""}
        keyFilter={keyId ?? "all"}
        statusFilter={status ?? "all"}
      />
    </PageShell>
  );
};

export default MainPage;
