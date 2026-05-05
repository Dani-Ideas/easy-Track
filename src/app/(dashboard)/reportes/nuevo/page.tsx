import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBreadcrumb } from "@/components/layout/Breadcrumb";
import { ReporteForm } from "@/components/reportes/ReporteForm";

export default function NuevoReportePage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <PageBreadcrumb
            segments={[
              { label: "Panel Principal", href: "/dashboard" },
              { label: "Nuevo Reporte" },
            ]}
          />
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Formulario de Inspección
          </h1>
        </div>
      </div>

      <ReporteForm />
    </div>
  );
}
