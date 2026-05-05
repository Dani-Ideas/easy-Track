import { Skeleton } from "@/components/ui/skeleton";

export default function ReporteDetalleLoading() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-16 w-full" />
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
