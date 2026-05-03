"use client";

import { useState, useCallback, useEffect } from "react";
import { Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

type Role = "ADMIN" | "STAFF" | "TECNICO";

const ROLE_LABEL: Record<Role, string> = {
  ADMIN:   "Administrador",
  STAFF:   "Jefe de Área",
  TECNICO: "Técnico",
};

interface PersonalItem {
  id: number;
  nombre: string;
  createdAt: string;
  area: { id: number; nombre: string } | null;
  rol: Role | null;
}

interface Props {
  areaId: number | null;
  areaNombre: string;
}

export function PersonalStaffClient({ areaId, areaNombre }: Props) {
  const [personal, setPersonal] = useState<PersonalItem[]>([]);
  const [loading,  setLoading]  = useState(false);

  const loadPersonal = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (areaId) params.set("areaId", String(areaId));
    fetch(`/api/personal?${params}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { setPersonal(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [areaId]);

  useEffect(() => { loadPersonal(); }, [loadPersonal]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Personal de {areaNombre}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Lista de personas asignadas a tu área.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={loadPersonal}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Registrado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">Cargando...</TableCell>
              </TableRow>
            )}
            {!loading && personal.map((p, i) => (
              <TableRow key={p.id}>
                <TableCell className="text-muted-foreground text-xs w-8">{i + 1}</TableCell>
                <TableCell className="font-medium">{p.nombre}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.area?.nombre ?? "—"}</TableCell>
                <TableCell>
                  {p.rol ? (
                    <Badge variant="outline">{ROLE_LABEL[p.rol]}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(p.createdAt).toLocaleDateString("es-MX", { dateStyle: "medium" })}
                </TableCell>
              </TableRow>
            ))}
            {!loading && personal.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  Sin personal registrado en esta área aún.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
