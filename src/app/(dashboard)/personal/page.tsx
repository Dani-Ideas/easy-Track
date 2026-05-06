import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PersonalAdminClient } from "@/components/personal/PersonalAdminClient";
import { PersonalStaffClient } from "@/components/personal/PersonalStaffClient";

export default async function PersonalPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (role !== "ADMIN" && role !== "STAFF") redirect("/dashboard");

  // ADMIN sees full management view
  if (role === "ADMIN") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" />
            Personal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión de cuentas de acceso, personal y áreas responsables
          </p>
        </div>
        <PersonalAdminClient />
      </div>
    );
  }

  // STAFF — fetch their area to render filtered view
  const dbUser = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { areaId: true, area: { select: { id: true, nombre: true } } },
      })
    : null;

  const areaNombre = dbUser?.area?.nombre ?? "General";
  const areaId     = dbUser?.areaId ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6" />
          Personal
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Personal asignado al área <strong>{areaNombre}</strong>
        </p>
      </div>
      <PersonalStaffClient areaId={areaId} areaNombre={areaNombre} />
    </div>
  );
}
