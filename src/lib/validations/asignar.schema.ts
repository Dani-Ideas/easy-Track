import { z } from "zod";

export const asignarTareaSchema = z.object({
  areaResponsable: z
    .string()
    .min(2, "El área es requerida")
    .max(50, "Máximo 50 caracteres"),
  observaciones: z.string().max(500, "Máximo 500 caracteres").optional(),
  estado: z.enum(["PENDIENTE", "EN_PROCESO", "ATENDIDO"]),
});

export type AsignarTareaValues = z.infer<typeof asignarTareaSchema>;
