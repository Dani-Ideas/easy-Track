"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: number;
  createdAt: Date | string;
  usuarioLogin: string;
  usuarioReal: string | null;
  accion: string;
  detalle: string | null;
  ip: string | null;
  dispositivo: string | null;
}

interface BitacoraPanelProps {
  logs: LogEntry[];
}

function formatFecha(d: Date | string) {
  return new Date(d).toLocaleString("es-MX", {
    dateStyle: "short",
    timeStyle: "medium",
    hour12: false,
  });
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return "Desconocido";
  if (/mobile/i.test(ua)) {
    if (/android/i.test(ua)) return "Android (móvil)";
    if (/iphone|ipad/i.test(ua)) return "iOS (móvil)";
    return "Móvil";
  }
  if (/windows/i.test(ua)) return "Windows (escritorio)";
  if (/macintosh|mac os/i.test(ua)) return "macOS (escritorio)";
  if (/linux/i.test(ua)) return "Linux (escritorio)";
  return "Escritorio";
}

export function BitacoraPanel({ logs }: BitacoraPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader
        className="pb-3 cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Bitácora de cambios
            <span className="text-xs font-normal text-muted-foreground">
              ({logs.length} {logs.length === 1 ? "registro" : "registros"})
            </span>
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>

      {open && (
        <CardContent className="pt-0">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">Sin registros todavía.</p>
          ) : (
            <ol className="relative border-l border-border ml-2 space-y-0">
              {logs.map((log, i) => (
                <li
                  key={log.id}
                  className={cn(
                    "ml-4 pb-5",
                    i === logs.length - 1 && "pb-0",
                  )}
                >
                  {/* Timeline dot */}
                  <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-background bg-primary/60" />

                  <div className="space-y-1">
                    {/* Action + timestamp */}
                    <p className="text-sm font-medium leading-tight">{log.accion}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFecha(log.createdAt)}
                    </p>

                    {/* Who */}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span>
                        <span className="text-foreground/70">Cuenta:</span>{" "}
                        {log.usuarioLogin}
                      </span>
                      {log.usuarioReal && (
                        <span>
                          <span className="text-foreground/70">Persona:</span>{" "}
                          {log.usuarioReal}
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      {log.ip && (
                        <span>
                          <span className="text-foreground/70">IP:</span> {log.ip}
                        </span>
                      )}
                      {log.dispositivo && (
                        <span>
                          <span className="text-foreground/70">Dispositivo:</span>{" "}
                          {parseUserAgent(log.dispositivo)}
                        </span>
                      )}
                    </div>

                    {log.detalle && (
                      <p className="text-xs text-muted-foreground italic">
                        "{log.detalle}"
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      )}
    </Card>
  );
}
