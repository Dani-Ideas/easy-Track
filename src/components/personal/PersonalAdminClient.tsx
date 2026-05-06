"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, UserPlus, RefreshCw, Pencil, Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "ADMIN" | "STAFF" | "TECNICO";

interface AreaItem {
  id: number;
  nombre: string;
  activo: boolean;
}

interface UsuarioItem {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
  area: { id: number; nombre: string } | null;
}

interface PersonalItem {
  id: number;
  nombre: string;
  createdAt: string;
  area: { id: number; nombre: string } | null;
  rol: Role | null;
}

const ROLE_LABEL: Record<Role, string> = {
  ADMIN:   "Administrador",
  STAFF:   "Jefe de Área",
  TECNICO: "Técnico",
};

function RolBadge({ rol }: { rol: Role | null }) {
  if (!rol) return <span className="text-xs text-muted-foreground">—</span>;
  return <Badge variant={ROLE_VARIANT[rol]}>{ROLE_LABEL[rol]}</Badge>;
}

const ROLE_VARIANT: Record<Role, "default" | "secondary" | "outline"> = {
  ADMIN:   "default",
  STAFF:   "secondary",
  TECNICO: "outline",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function PersonalAdminClient() {
  // ── data ─────────────────────────────────────────────────────────────────────
  const [usuarios,  setUsuarios]  = useState<UsuarioItem[]>([]);
  const [personal,  setPersonal]  = useState<PersonalItem[]>([]);
  const [areas,     setAreas]     = useState<AreaItem[]>([]);
  const [loadingU,  setLoadingU]  = useState(false);
  const [loadingP,  setLoadingP]  = useState(false);
  const [loadingA,  setLoadingA]  = useState(false);

  // ── nueva cuenta dialog ───────────────────────────────────────────────────────
  const [openNueva,    setOpenNueva]    = useState(false);
  const [formName,     setFormName]     = useState("");
  const [formEmail,    setFormEmail]    = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole,     setFormRole]     = useState<Role>("STAFF");
  const [formAreaId,   setFormAreaId]   = useState<string>("");
  const [savingU,      setSavingU]      = useState(false);
  const [errorU,       setErrorU]       = useState("");

  // ── agregar personal dialog ───────────────────────────────────────────────────
  const [openPersonal, setOpenPersonal] = useState(false);
  const [formNombreP,  setFormNombreP]  = useState("");
  const [savingP,      setSavingP]      = useState(false);

  // ── nueva área dialog ─────────────────────────────────────────────────────────
  const [openNuevaArea,    setOpenNuevaArea]    = useState(false);
  const [formNombreArea,   setFormNombreArea]   = useState("");
  const [savingA,          setSavingA]          = useState(false);
  const [errorA,           setErrorA]           = useState("");

  // ── loaders ──────────────────────────────────────────────────────────────────
  const loadUsuarios = useCallback(() => {
    setLoadingU(true);
    fetch("/api/usuarios")
      .then(r => r.ok ? r.json() : [])
      .then(d => { setUsuarios(Array.isArray(d) ? d : []); setLoadingU(false); })
      .catch(() => setLoadingU(false));
  }, []);

  const loadPersonal = useCallback(() => {
    setLoadingP(true);
    fetch("/api/personal")
      .then(r => r.ok ? r.json() : [])
      .then(d => { setPersonal(Array.isArray(d) ? d : []); setLoadingP(false); })
      .catch(() => setLoadingP(false));
  }, []);

  const loadAreas = useCallback(() => {
    setLoadingA(true);
    fetch("/api/areas")
      .then(r => r.ok ? r.json() : [])
      .then(d => { setAreas(Array.isArray(d) ? d : []); setLoadingA(false); })
      .catch(() => setLoadingA(false));
  }, []);

  useEffect(() => { loadUsuarios(); loadPersonal(); loadAreas(); }, [loadUsuarios, loadPersonal, loadAreas]);

  // ── change role ───────────────────────────────────────────────────────────────
  async function changeRole(id: string, role: Role) {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    await fetch(`/api/usuarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
  }

  // ── change area ───────────────────────────────────────────────────────────────
  async function changeArea(id: string, areaId: string) {
    const area = areas.find(a => String(a.id) === areaId) ?? null;
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, area } : u));
    await fetch(`/api/usuarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ areaId }),
    });
  }

  // ── crear cuenta ──────────────────────────────────────────────────────────────
  async function handleCrearCuenta() {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) return;
    setSavingU(true);
    setErrorU("");
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword,
        role: formRole,
        areaId: formAreaId || undefined,
      }),
    });
    if (res.ok) {
      setOpenNueva(false);
      setFormName(""); setFormEmail(""); setFormPassword(""); setFormRole("STAFF"); setFormAreaId("");
      loadUsuarios();
    } else {
      const d = await res.json();
      setErrorU(d.error ?? "Error al crear la cuenta");
    }
    setSavingU(false);
  }

  // ── agregar personal ──────────────────────────────────────────────────────────
  async function handleAgregarPersonal() {
    if (!formNombreP.trim()) return;
    setSavingP(true);
    await fetch("/api/personal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: formNombreP.trim() }),
    });
    setSavingP(false);
    setOpenPersonal(false);
    setFormNombreP("");
    loadPersonal();
  }

  // ── crear área ────────────────────────────────────────────────────────────────
  async function handleCrearArea() {
    if (!formNombreArea.trim()) return;
    setSavingA(true);
    setErrorA("");
    const res = await fetch("/api/areas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: formNombreArea.trim() }),
    });
    if (res.ok) {
      setOpenNuevaArea(false);
      setFormNombreArea("");
      loadAreas();
    } else {
      const d = await res.json();
      setErrorA(d.error ?? "Error al crear el área");
    }
    setSavingA(false);
  }

  // ── toggle área activo ────────────────────────────────────────────────────────
  async function toggleArea(area: AreaItem) {
    const newActivo = !area.activo;
    setAreas(prev => prev.map(a => a.id === area.id ? { ...a, activo: newActivo } : a));
    const res = await fetch(`/api/areas/${area.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: newActivo }),
    });
    if (!res.ok) loadAreas();
  }

  const activeAreas = areas.filter(a => a.activo);

  return (
    <div className="space-y-10">

      {/* ── Cuentas de acceso ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Cuentas de acceso
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Usuarios que pueden iniciar sesión en el sistema
            </p>
          </div>
          <Button size="sm" className="gap-2" onClick={() => { setErrorU(""); setOpenNueva(true); }}>
            <UserPlus className="h-4 w-4" />
            Nueva cuenta
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Área</TableHead>
                <TableHead className="w-[140px]">Cambiar rol</TableHead>
                <TableHead className="w-[160px]">Cambiar área</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingU && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">Cargando...</TableCell>
                </TableRow>
              )}
              {!loadingU && usuarios.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_VARIANT[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.area?.nombre ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Select value={u.role} onValueChange={(v) => changeRole(u.id, v as Role)}>
                      <SelectTrigger className="h-8 text-xs w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STAFF">Jefe de Área</SelectItem>
                        <SelectItem value="TECNICO">Técnico</SelectItem>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {u.role !== "ADMIN" ? (
                      <Select
                        value={u.area ? String(u.area.id) : ""}
                        onValueChange={(v) => changeArea(u.id, v)}
                      >
                        <SelectTrigger className="h-8 text-xs w-[150px]">
                          <SelectValue placeholder="Sin área" />
                        </SelectTrigger>
                        <SelectContent>
                          {areas.filter(a => a.activo).map(a => (
                            <SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs text-muted-foreground">General (fijo)</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!loadingU && usuarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">Sin cuentas registradas.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <Separator />

      {/* ── Lista de personal ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Lista de personal
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Nombres que aparecen como solicitante en los reportes.
              Se añaden automáticamente al enviar un reporte.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={loadPersonal}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={() => { setFormNombreP(""); setOpenPersonal(true); }}>
              <UserPlus className="h-4 w-4" />
              Agregar
            </Button>
          </div>
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
              {loadingP && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">Cargando...</TableCell>
                </TableRow>
              )}
              {!loadingP && personal.map((p, i) => (
                <TableRow key={p.id}>
                  <TableCell className="text-muted-foreground text-xs w-8">{i + 1}</TableCell>
                  <TableCell className="font-medium">{p.nombre}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.area?.nombre ?? "—"}</TableCell>
                  <TableCell><RolBadge rol={p.rol} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(p.createdAt).toLocaleDateString("es-MX", { dateStyle: "medium" })}
                  </TableCell>
                </TableRow>
              ))}
              {!loadingP && personal.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    Sin personal registrado aún.
                    Al enviar el primer reporte se registrará automáticamente.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <Separator />

      {/* ── Áreas responsables ────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Áreas responsables
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Áreas que se asignan en los reportes y cuentas de usuario.
              El área <strong>General</strong> no puede modificarse.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={loadAreas}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={() => { setFormNombreArea(""); setErrorA(""); setOpenNuevaArea(true); }}>
              <Plus className="h-4 w-4" />
              Nueva área
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingA && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">Cargando...</TableCell>
                </TableRow>
              )}
              {!loadingA && areas.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.nombre}</TableCell>
                  <TableCell>
                    <Badge variant={a.activo ? "secondary" : "outline"}>
                      {a.activo ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {a.nombre !== "General" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7"
                        onClick={() => toggleArea(a)}
                      >
                        {a.activo ? "Desactivar" : "Activar"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!loadingA && areas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">Sin áreas registradas.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* ── Dialog: Nueva cuenta ──────────────────────────────────────────────── */}
      <Dialog open={openNueva} onOpenChange={setOpenNueva}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nueva cuenta de acceso</DialogTitle>
            <DialogDescription>
              Crea una cuenta para que el usuario pueda iniciar sesión.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="new-name">Nombre</Label>
              <Input id="new-name" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ej. Ana López" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-email">Email</Label>
              <Input id="new-email" type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="ana@institución.edu" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">Contraseña inicial</Label>
              <Input id="new-password" type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select value={formRole} onValueChange={v => setFormRole(v as Role)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STAFF">Jefe de Área</SelectItem>
                  <SelectItem value="TECNICO">Técnico</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formRole !== "ADMIN" && (
              <div className="space-y-1.5">
                <Label>Área asignada</Label>
                <Select value={formAreaId} onValueChange={setFormAreaId}>
                  <SelectTrigger><SelectValue placeholder="General (predeterminado)" /></SelectTrigger>
                  <SelectContent>
                    {activeAreas.map(a => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {errorU && <p className="text-xs text-destructive">{errorU}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNueva(false)}>Cancelar</Button>
            <Button
              onClick={handleCrearCuenta}
              disabled={savingU || !formName.trim() || !formEmail.trim() || !formPassword.trim()}
            >
              {savingU ? "Creando..." : "Crear cuenta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Agregar personal ──────────────────────────────────────────── */}
      <Dialog open={openPersonal} onOpenChange={setOpenPersonal}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Agregar personal</DialogTitle>
            <DialogDescription>
              Registra un nombre manualmente en la lista de personal.
            </DialogDescription>
          </DialogHeader>
          <div className="py-1">
            <Label htmlFor="nombre-p">Nombre completo</Label>
            <Input
              id="nombre-p"
              className="mt-1.5"
              value={formNombreP}
              onChange={e => setFormNombreP(e.target.value)}
              placeholder="Ej. Carlos Mendoza"
              onKeyDown={e => e.key === "Enter" && handleAgregarPersonal()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPersonal(false)}>Cancelar</Button>
            <Button onClick={handleAgregarPersonal} disabled={savingP || !formNombreP.trim()}>
              {savingP ? "Guardando..." : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Nueva área ────────────────────────────────────────────────── */}
      <Dialog open={openNuevaArea} onOpenChange={setOpenNuevaArea}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Nueva área responsable</DialogTitle>
            <DialogDescription>
              Agrega un área que se podrá asignar en los reportes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-1">
            <Label htmlFor="nombre-area">Nombre del área</Label>
            <Input
              id="nombre-area"
              className="mt-1.5"
              value={formNombreArea}
              onChange={e => setFormNombreArea(e.target.value)}
              placeholder="Ej. Jardinería"
              onKeyDown={e => e.key === "Enter" && handleCrearArea()}
              autoFocus
            />
            {errorA && <p className="text-xs text-destructive mt-1.5">{errorA}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNuevaArea(false)}>Cancelar</Button>
            <Button onClick={handleCrearArea} disabled={savingA || !formNombreArea.trim()}>
              {savingA ? "Creando..." : "Crear área"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
