"use client";

import { useState, useEffect, useCallback } from "react";
import { UserCheck } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LS_KEY = "faciltrack_identidad";

export interface StoredIdentidad {
  email: string;
  nombre: string;
}

export function getIdentidad(): StoredIdentidad | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as StoredIdentidad) : null;
  } catch {
    return null;
  }
}

export function useIdentidad(): string | null {
  const [nombre] = useState<string | null>(() => getIdentidad()?.nombre ?? null);
  return nombre;
}

// ─────────────────────────────────────────────────────────────────────────────

interface PersonalEntry {
  id: number;
  nombre: string;
  rol: string | null;
  areaId: number | null;
}

interface Props {
  role: string;
  email: string;
  areaId?: number | null;
}

export function IdentidadGuard({ role, email, areaId }: Props) {
  const isSharedAccount = role === "STAFF" || role === "TECNICO";
  const [open, setOpen] = useState<boolean>(() => {
    if (!isSharedAccount) return false;
    const stored = getIdentidad();
    return !stored || stored.email !== email;
  });
  const [personal, setPersonal] = useState<PersonalEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [manual, setManual] = useState("");
  const [useManual, setUseManual] = useState(false);

  const loadPersonal = useCallback(() => {
    const params = new URLSearchParams({ disponibleParaRol: role });
    if (areaId) params.set("areaIdRol", String(areaId));
    fetch(`/api/personal?${params}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setPersonal(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [role, areaId]);

  useEffect(() => {
    if (open) loadPersonal();
  }, [open, loadPersonal]);

  async function handleConfirm() {
    const nombre = useManual ? manual.trim() : personal.find(p => String(p.id) === selectedId)?.nombre ?? "";
    if (!nombre) return;

    // Silently sync Personal record in the background — no UI feedback
    if (useManual) {
      // New name: create with user's role and area
      fetch("/api/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, rol: role, areaId: areaId ?? null }),
      }).catch(() => {});
    } else {
      // Existing name: set rol+area if not already set
      const entry = personal.find(p => String(p.id) === selectedId);
      if (entry && (!entry.rol || !entry.areaId)) {
        fetch(`/api/personal/${entry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rol: entry.rol ?? role,
            areaId: entry.areaId ?? areaId ?? null,
          }),
        }).catch(() => {});
      }
    }

    localStorage.setItem(LS_KEY, JSON.stringify({ email, nombre }));
    setOpen(false);
  }

  if (!isSharedAccount) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-sm"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            ¿Quién eres?
          </DialogTitle>
          <DialogDescription>
            Esta es una cuenta compartida. Selecciona tu nombre para registrar tus acciones correctamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {!useManual ? (
            <div className="space-y-1.5">
              <Label>Tu nombre</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nombre..." />
                </SelectTrigger>
                <SelectContent>
                  {personal.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                className="text-xs text-muted-foreground underline mt-1"
                onClick={() => setUseManual(true)}
              >
                Mi nombre no está en la lista
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="nombre-manual">Escribe tu nombre</Label>
              <Input
                id="nombre-manual"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="Ej. Carlos Mendoza"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              />
              <button
                type="button"
                className="text-xs text-muted-foreground underline mt-1"
                onClick={() => setUseManual(false)}
              >
                Volver a la lista
              </button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleConfirm}
            disabled={useManual ? !manual.trim() : !selectedId}
          >
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
