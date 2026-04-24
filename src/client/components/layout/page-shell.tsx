import { Topbar } from "@/client/components/layout/topbar";

type Props = {
  userName: string;
  userRole: "admin" | "user";
  children: React.ReactNode;
};

export const PageShell = ({ userName, userRole, children }: Props) => (
  <div className="min-h-screen flex flex-col bg-muted/40">
    <Topbar userName={userName} userRole={userRole} />
    <main className="flex-1 px-8 py-6 max-w-[1280px] w-full mx-auto">
      {children}
    </main>
  </div>
);
