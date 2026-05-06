"use client";

import { useState, useCallback } from "react";
import { User, CalendarDays, UserPlus } from "lucide-react";
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
  const [esNuevo, setEsNuevo] = useState(false);

  const checkPersonal = useCallback(async (nombre: string) => {
    if (!nombre.trim() || nombre.trim().length < 2) { setEsNuevo(false); return; }
    try {
      const res  = await fetch("/api/personal");
      const list = await res.json() as { nombreNorm: string }[];
      const norm = nombre.trim().toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
      setEsNuevo(!list.some((p) => p.nombreNorm === norm));
    } catch { setEsNuevo(false); }
  }, []);

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
                <Input
                  placeholder="Ej. María García"
                  {...field}
                  onBlur={(e) => {
                    field.onBlur();
                    checkPersonal(e.target.value);
                  }}
                  onChange={(e) => {
                    field.onChange(e);
                    if (esNuevo) setEsNuevo(false);
                  }}
                />
              </FormControl>
              <FormMessage />
              {esNuevo && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <UserPlus className="h-3 w-3" />
                  Se registrará como nuevo personal
                </p>
              )}
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
