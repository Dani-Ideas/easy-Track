"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-4">
      <AlertTriangle className="h-16 w-16 text-destructive/40" />
      <h1 className="text-2xl font-bold">Algo salió mal</h1>
      <p className="text-muted-foreground max-w-sm">
        Ocurrió un error inesperado. Intenta recargar la página.
      </p>
      <Button onClick={reset} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Reintentar
      </Button>
    </div>
  );
}
