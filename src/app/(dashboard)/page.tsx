import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { queryBorrowings, queryKeys } from "@/app/queries/keys";
import { KeysDashboard } from "@/client/components/features/keys/keys-dashboard";
import type { BorrowingStatus } from "@/server/domain/borrowings/entity";
import { auth } from "@/server/lib/auth";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const MainPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const [session, params] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    searchParams,
  ]);
  if (!session) redirect("/login");

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
    <KeysDashboard
      keys={keys}
      borrowings={borrowings}
      currentUserId={session.user.id}
      keyFilter={keyId ?? "all"}
      statusFilter={status ?? "all"}
    />
  );
};

export default MainPage;
