import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Topbar } from "@/client/components/layout/topbar";
import { auth } from "@/server/lib/auth";

type Props = React.PropsWithChildren;

const DashboardLayout: React.FC<Props> = async ({ children }: Props) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const userRole =
    "role" in session.user && session.user.role === "admin" ? "admin" : "user";

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <Topbar userName={session.user.name} userRole={userRole} />
      <main className="flex-1 px-8 py-6 max-w-[1280px] w-full mx-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
