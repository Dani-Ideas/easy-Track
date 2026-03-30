import Link from "next/link";
import { FileX, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-4">
      <FileX className="h-16 w-16 text-muted-foreground/40" />
      <h1 className="text-2xl font-bold">Página no encontrada</h1>
      <p className="text-muted-foreground max-w-sm">
        La página que buscas no existe o fue eliminada.
      </p>
      <Button asChild>
        <Link href="/dashboard" className="gap-2">
          <Home className="h-4 w-4" />
          Ir al panel principal
        </Link>
      </Button>
    </div>
  );
}
