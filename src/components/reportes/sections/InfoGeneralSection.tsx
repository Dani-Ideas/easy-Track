import { User, CalendarDays } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormSectionHeader } from "../FormSectionHeader";
import type { UseFormReturn } from "react-hook-form";
import type { ReporteFormValues } from "@/lib/validations/reporte.schema";

interface InfoGeneralSectionProps {
  form: UseFormReturn<ReporteFormValues>;
}

export function InfoGeneralSection({ form }: InfoGeneralSectionProps) {
  return (
    <div className="space-y-4">
      <FormSectionHeader
        icon={User}
        title="Información General"
        description="Datos del solicitante y fecha de inspección"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="nombreSolicitante"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del solicitante</FormLabel>
              <FormControl>
                <Input placeholder="Ej. María García" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fechaInspeccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de inspección</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
