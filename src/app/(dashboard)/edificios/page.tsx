import { Building2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { EdificioManager } from "@/components/edificios/EdificioManager";

export default async function EdificiosPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Gestión de Ubicaciones
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Navega y administra los tipos, grupos y espacios de la institución
        </p>
      </div>

      <EdificioManager isAdmin={isAdmin} />
    </div>
  );
}
