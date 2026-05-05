import { ClipboardCheck, Lightbulb, Wrench } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormSectionHeader } from "../FormSectionHeader";
import { StarRating } from "../StarRating";
import { ToggleField } from "../ToggleField";
import type { UseFormReturn } from "react-hook-form";
import type { ReporteFormValues } from "@/lib/validations/reporte.schema";

interface EvaluacionSectionProps {
  form: UseFormReturn<ReporteFormValues>;
}

export function EvaluacionSection({ form }: EvaluacionSectionProps) {
  return (
    <div className="space-y-4">
      <FormSectionHeader
        icon={ClipboardCheck}
        title="Criterios de Evaluación"
        description="Califica cada aspecto del espacio inspeccionado"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Limpieza */}
        <FormField
          control={form.control}
          name="evaluacion.limpieza"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limpieza</FormLabel>
              <FormControl>
                <StarRating
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Seguridad */}
        <FormField
          control={form.control}
          name="evaluacion.seguridad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seguridad y cumplimiento</FormLabel>
              <FormControl>
                <StarRating
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Iluminación */}
        <FormField
          control={form.control}
          name="evaluacion.iluminacion"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ToggleField
                  id="iluminacion"
                  label="Iluminación funcional"
                  description="El sistema de iluminación opera correctamente"
                  icon={Lightbulb}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Equipo */}
        <FormField
          control={form.control}
          name="evaluacion.equipo"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ToggleField
                  id="equipo"
                  label="Equipo operativo"
                  description="El mobiliario y equipo está en buen estado"
                  icon={Wrench}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
