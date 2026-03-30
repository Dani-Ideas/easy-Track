export type EstadoReporte = "PENDIENTE" | "EN_PROCESO" | "ATENDIDO";

export const estadoLabels: Record<EstadoReporte, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En Proceso",
  ATENDIDO: "Atendido",
};

export const estadoVariants: Record<
  EstadoReporte,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDIENTE: "destructive",
  EN_PROCESO: "default",
  ATENDIDO: "secondary",
};

export const estadoColors: Record<EstadoReporte, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  EN_PROCESO: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  ATENDIDO: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export const transicionesEstado: Record<EstadoReporte, EstadoReporte[]> = {
  PENDIENTE: ["EN_PROCESO"],
  EN_PROCESO: ["ATENDIDO"],
  ATENDIDO: [],
};
