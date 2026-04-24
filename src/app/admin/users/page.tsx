import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { queryUsers } from "@/app/queries/users/management";
import { UserManagement } from "@/client/components/features/users/user-management";
import { PageShell } from "@/client/components/layout/page-shell";
import { auth } from "@/server/lib/auth";

const AdminUsersPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  const users = await queryUsers();

  return (
    <PageShell userName={session.user.name} userRole="admin">
      <div className="flex flex-col gap-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="size-3" />
          メインに戻る
        </Link>

        <UserManagement users={users} />
      </div>
    </PageShell>
  );
};

export default AdminUsersPage;
