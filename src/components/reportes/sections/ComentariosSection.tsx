import { MessageSquare } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FormSectionHeader } from "../FormSectionHeader";
import type { UseFormReturn } from "react-hook-form";
import type { ReporteFormValues } from "@/lib/validations/reporte.schema";

interface ComentariosSectionProps {
  form: UseFormReturn<ReporteFormValues>;
}

export function ComentariosSection({ form }: ComentariosSectionProps) {
  return (
    <div className="space-y-4">
      <FormSectionHeader
        icon={MessageSquare}
        title="Comentarios y Observaciones"
        description="Describe los problemas o situaciones observadas"
      />
      <FormField
        control={form.control}
        name="descripcion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción del problema</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe los problemas encontrados durante la inspección..."
                className="min-h-[100px] resize-y"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
