import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { IdentidadGuard } from "@/components/layout/IdentidadGuard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - desktop only */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          userName={session.user?.name}
          userEmail={session.user?.email}
          userRole={session.user?.role}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>

      {/* Identity prompt for shared accounts */}
      <IdentidadGuard
        role={session.user?.role ?? ""}
        email={session.user?.email ?? ""}
        areaId={session.user?.areaId}
      />
    </div>
  );
}
