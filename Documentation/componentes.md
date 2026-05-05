# Catálogo de Componentes

## Layout

### `Sidebar` — `src/components/layout/Sidebar.tsx`

Barra de navegación lateral. Solo visible en pantallas `lg` y superiores.

**Elementos:**
- Logo con icono `ShieldCheck` y texto "FaciliTrack"
- Links de navegación con resaltado de ruta activa (`usePathname`)
- Footer con versión y `ThemeToggle`

**Items de navegación:**

| Ícono | Label | Ruta |
|---|---|---|
| LayoutDashboard | Panel Principal | `/dashboard` |
| ClipboardList | Reportes | `/reportes` |
| Building2 | Edificios | `/edificios` |
| Users | Personal | `/personal` |
| BarChart3 | Analíticas | `/analiticas` |

---

### `Header` — `src/components/layout/Header.tsx`

Barra superior sticky.

**Elementos:**
- Botón de menú móvil (visible solo en `< lg`) → abre `Sheet` con el Sidebar
- Campana de notificaciones con punto rojo
- Menú desplegable de usuario: nombre, email, rol, botón de cerrar sesión

**Props:**
```typescript
{
  userName?: string | null
  userEmail?: string | null
  userRole?: string | null
}
```

---

### `ThemeToggle` — `src/components/layout/ThemeToggle.tsx`

Botón que alterna entre tema claro y oscuro usando `next-themes`.

---

### `PageBreadcrumb` — `src/components/layout/Breadcrumb.tsx`

Breadcrumb de navegación basado en shadcn/ui.

**Props:**
```typescript
{
  segments: Array<{ label: string; href?: string }>
}
```

**Uso:**
```tsx
<PageBreadcrumb
  segments={[
    { label: "Panel Principal", href: "/dashboard" },
    { label: "Nuevo Reporte" },
  ]}
/>
```

---

## Dashboard

### `StatsCard` — `src/components/dashboard/StatsCard.tsx`

Tarjeta de métrica con ícono, título, valor y descripción opcional.

**Props:**
```typescript
{
  title: string
  value: number | string
  description?: string
  icon: LucideIcon
  iconColor?: string
  trend?: { value: number; label: string; positive?: boolean }
}
```

---

### `ReportsFilters` — `src/components/dashboard/ReportsFilters.tsx`

Controles de filtrado del dashboard. Escribe en `useUIStore`.

**Filtros disponibles:**
- Tipo de ubicación (Select)
- Estado (Select: Pendiente / En Proceso / Atendido)
- Fecha desde (Input date)
- Fecha hasta (Input date)
- Botón "Limpiar" si hay filtros activos

---

### `ReportsTable` — `src/components/dashboard/ReportsTable.tsx`

Tabla de reportes. Componente Server-compatible (sin hooks).

**Props:**
```typescript
{
  reportes: ReporteRow[]
}
```

**Columnas:** Fecha | Solicitante | Tipo | Edificio/Espacio | Estado | Ver

---

### `TablePagination` — `src/components/dashboard/TablePagination.tsx`

Paginación reactiva. Lee y escribe `filters.page` en `useUIStore`.

**Props:**
```typescript
{
  total: number
}
```

Muestra: "Mostrando X–Y de Z reportes" + botones anterior/siguiente.

---

### `DashboardClient` — `src/components/dashboard/DashboardClient.tsx`

Client Component que combina la tabla con la paginación y hace fetch reactivo cuando cambian los filtros.

**Comportamiento:**
1. Observa `useUIStore.filters` con `useEffect`
2. Construye query string y llama `GET /api/reportes`
3. Muestra `Skeleton` durante la carga
4. Renderiza `ReportsTable` + `TablePagination`

---

### `ExportButton` — `src/components/dashboard/ExportButton.tsx`

Botón que exporta los reportes filtrados actuales a un archivo Excel (.xlsx).

**Comportamiento:**
1. Lee los filtros de `useUIStore`
2. Llama `GET /api/reportes` con `pageSize=1000`
3. Llama `exportReportesToExcel()` para descargar el archivo

---

## Formulario de Inspección

### `ReporteForm` — `src/components/reportes/ReporteForm.tsx`

Componente principal del formulario. Client Component.

**Comportamiento:**
- Inicializa `useForm` con `zodResolver(reporteFormSchema)`
- Detecta borrador guardado → muestra `DraftBanner`
- Botón "Guardar borrador" → persiste en `useReporteFormStore`
- Botón "Enviar reporte" → `POST /api/reportes` → redirige a `/reportes/[id]`

---

### `DraftBanner` — `src/components/reportes/DraftBanner.tsx`

Alerta amber que aparece cuando hay un borrador guardado en localStorage.

**Props:**
```typescript
{
  onRestore: () => void  // Callback para cargar el borrador en el formulario
}
```

**Muestra:** timestamp de último guardado + botones "Restaurar" y eliminar.

---

### `StarRating` — `src/components/reportes/StarRating.tsx`

Input de calificación de 1 a 5 estrellas usando íconos `Star` de Lucide.

**Props:**
```typescript
{
  value: number          // 0-5
  onChange: (n: number) => void
  disabled?: boolean
}
```

---

### `ToggleField` — `src/components/reportes/ToggleField.tsx`

Campo booleano con ícono, etiqueta, descripción y Switch de shadcn/ui.

**Props:**
```typescript
{
  id: string
  label: string
  description?: string
  icon?: LucideIcon
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}
```

---

### `FormSectionHeader` — `src/components/reportes/FormSectionHeader.tsx`

Encabezado de sección del formulario con ícono, título y separador.

**Props:**
```typescript
{
  icon: LucideIcon
  title: string
  description?: string
}
```

---

### Secciones del formulario

Todas reciben `form: UseFormReturn<ReporteFormValues>`.

| Componente | Campos | Archivo |
|---|---|---|
| `InfoGeneralSection` | `nombreSolicitante`, `fechaInspeccion` | `sections/InfoGeneralSection.tsx` |
| `UbicacionSection` | `tipoUbicacion`, grupo (select local), `idEspacio` | `sections/UbicacionSection.tsx` |
| `EvaluacionSection` | `evaluacion.limpieza`, `evaluacion.seguridad`, `evaluacion.iluminacion`, `evaluacion.equipo` | `sections/EvaluacionSection.tsx` |
| `ComentariosSection` | `descripcion` | `sections/ComentariosSection.tsx` |
**`UbicacionSection`** tiene lógica especial:
- Carga tipos y grupos con `useEffect` al montar
- Al seleccionar un grupo, hace fetch de `/api/espacios?idGrupo=N`
- El select de espacio se deshabilita hasta seleccionar un grupo

---

## Vista Detalle del Reporte

### `ReporteHeader` — `src/components/detalle/ReporteHeader.tsx`

Encabezado con número de reporte, `StatusBadge` y timestamps.

**Props:**
```typescript
{
  id: number
  estado: string
  fechaCreacion: Date
  fechaAtencion?: Date | null
  fechaResolucion?: Date | null
}
```

---

### `InfoGrid` — `src/components/detalle/InfoGrid.tsx`

Grid 2×2 con datos básicos del reporte.

**Props:**
```typescript
{
  nombreSolicitante: string
  fechaInspeccion: Date
  tipoUbicacion: string
  edificio?: string
  espacio?: string
}
```

---

### `EvaluacionChecklist` — `src/components/detalle/EvaluacionChecklist.tsx`

Renderiza el JSON de evaluación como una lista de criterios con íconos y estados.

**Criterios de calificación por estrellas:**
- 4-5 → "Bueno" (verde)
- 2-3 → "Regular" (amber)
- 0-1 → "Deficiente" (rojo)

**Criterios booleanos:**
- `true` → "Funcional" con `CheckCircle2` verde
- `false` → "No funcional" con `XCircle` rojo

---


---

### `EstadoSidebar` — `src/components/detalle/EstadoSidebar.tsx`

Panel lateral de gestión de estado. Client Component.

**Props:**
```typescript
{
  reporteId: number
  estado: string
  areaResponsable?: string | null
  observaciones?: string | null
  fechaAtencion?: Date | null
  fechaResolucion?: Date | null
  userRole?: string
}
```

**Comportamiento:**
- Muestra `StatusBadge` con el estado actual
- Si el usuario es ADMIN o TECNICO y el reporte no está ATENDIDO:
  - `PENDIENTE` → botón "Iniciar atención" → abre `AsignarTareaModal`
  - `EN_PROCESO` → botón "Marcar como resuelto" → abre `AsignarTareaModal`
- Si hay datos de atención, muestra tarjeta con área, fechas y observaciones

---

### `AsignarTareaModal` — `src/components/detalle/AsignarTareaModal.tsx`

Dialog con formulario para asignar/resolver un reporte. Client Component.

**Props:**
```typescript
{
  open: boolean
  onOpenChange: (open: boolean) => void
  reporteId: number
  estadoActual: string
}
```

**Campos:**
- Área responsable (Select con 6 opciones predefinidas)
- Observaciones técnicas (Textarea)

**Al enviar:**
1. `PATCH /api/reportes/[id]` con `{ estado, areaResponsable, observaciones }`
2. `router.refresh()` para recargar datos del server

---

## Componentes UI compartidos

### `StatusBadge` — `src/components/ui/StatusBadge.tsx`

Badge con color según el estado del reporte.

| Estado | Color |
|---|---|
| PENDIENTE | Amber |
| EN_PROCESO | Azul |
| ATENDIDO | Esmeralda |

**Props:**
```typescript
{
  estado: string
  className?: string
}
```

---

### `UserAvatar` — `src/components/ui/UserAvatar.tsx`

Avatar con iniciales del nombre. El color de fondo varía según la primera letra.

**Props:**
```typescript
{
  name?: string | null
  className?: string
  size?: "sm" | "md"
}
```

---

### `EmptyState` — `src/components/ui/EmptyState.tsx`

Estado vacío centrado con ícono, título y descripción.

**Props:**
```typescript
{
  icon?: LucideIcon
  title?: string
  description?: string
}
```

---

## shadcn/ui instalados

Componentes primitivos disponibles en `src/components/ui/`:

`alert` · `avatar` · `badge` · `breadcrumb` · `button` · `calendar` · `card` · `dialog` · `dropdown-menu` · `form` · `input` · `label` · `popover` · `select` · `separator` · `sheet` · `skeleton` · `switch` · `table` · `textarea` · `tooltip`
