"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  asignarTareaSchema,
  type AsignarTareaValues,
} from "@/lib/validations/asignar.schema";

interface AsignarTareaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reporteId: number;
  estadoActual: string;
}

const areasResponsables = [
  "Mantenimiento General",
  "Electricidad",
  "Plomería",
  "Limpieza",
  "Infraestructura",
  "Tecnología",
];

export function AsignarTareaModal({
  open,
  onOpenChange,
  reporteId,
  estadoActual,
}: AsignarTareaModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const nextEstado =
    estadoActual === "PENDIENTE"
      ? "EN_PROCESO"
      : estadoActual === "EN_PROCESO"
      ? "ATENDIDO"
      : null;

  const form = useForm<AsignarTareaValues>({
    resolver: zodResolver(asignarTareaSchema),
    defaultValues: {
      areaResponsable: "",
      observaciones: "",
      estado: (nextEstado as AsignarTareaValues["estado"]) ?? "EN_PROCESO",
    },
  });

  async function onSubmit(values: AsignarTareaValues) {
    setLoading(true);
    const res = await fetch(`/api/reportes/${reporteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      onOpenChange(false);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {estadoActual === "PENDIENTE"
              ? "Asignar tarea"
              : "Marcar como resuelto"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="areaResponsable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área responsable</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar área..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areasResponsables.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones técnicas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe las acciones a tomar o realizadas..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
