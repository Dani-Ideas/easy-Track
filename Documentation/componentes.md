# Catálogo de Componentes

## Layout

### `Sidebar` — `src/components/layout/Sidebar.tsx`

Barra de navegación lateral colapsable.

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
- Botón de menú móvil (abre `Sheet` con Sidebar en pantallas pequeñas)
- Menú desplegable de usuario: nombre, email, rol, botón cerrar sesión

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

Alterna entre tema claro y oscuro usando `next-themes`.

---

### `PageBreadcrumb` — `src/components/layout/Breadcrumb.tsx`

**Props:**
```typescript
{
  segments: Array<{ label: string; href?: string }>
}
```

---

## Dashboard

### `DashboardClient` — `src/components/dashboard/DashboardClient.tsx`

Client Component que combina filtros, tabla y paginación con fetch reactivo.

1. Observa `useUIStore.filters` con `useEffect`
2. Construye query string y llama `GET /api/reportes`
3. Muestra skeletons durante la carga
4. Renderiza `ReportsTable` + `TablePagination`

---

### `ReportsFilters` — `src/components/dashboard/ReportsFilters.tsx`

Controles de filtrado: tipo de ubicación, estado, rango de fechas y botón "Limpiar".

---

### `ReportsTable` — `src/components/dashboard/ReportsTable.tsx`

Tabla de reportes. **Columnas:** Fecha · Solicitante · Tipo · Edificio/Espacio · Estado · Ver

---

### `TablePagination` — `src/components/dashboard/TablePagination.tsx`

Muestra "Mostrando X–Y de Z reportes" + botones anterior/siguiente.

---

### `ExportButton` — `src/components/dashboard/ExportButton.tsx`

Exporta los reportes filtrados actuales a Excel (.xlsx) llamando `GET /api/reportes` con `pageSize=1000`.

---

## Formulario de Inspección

### `ReporteForm` — `src/components/reportes/ReporteForm.tsx`

Componente principal del formulario. Client Component.

- Inicializa `useForm` con `zodResolver(reporteFormSchema)`
- Botón "Enviar reporte" → `POST /api/reportes` → redirige a `/reportes/[id]`
- Orquesta las secciones: `InfoGeneralSection` → `LocationPicker` → `EvaluacionSection` → `ComentariosSection`

---

### `LocationPicker` — `src/components/reportes/sections/LocationPicker.tsx`

Selector de ubicación en 3 pasos con breadcrumb tipo flecha.

**Flujo:**
1. **Tipo** — lista tipos de espacio; al seleccionar carga los grupos del tipo
2. **Grupo** — lista edificios/bloques; al seleccionar carga los espacios
3. **Espacio** — lista espacios específicos; al seleccionar colapsa el panel y muestra resumen

**Comportamiento:**
- El panel de lista se oculta cuando los 3 pasos están completos
- El breadcrumb permite volver a pasos anteriores (los ya completados)
- Llama `onCategoriaChange(categoriaEvaluacion)` para que `ReporteForm` actualice `EvaluacionSection`

---

### `EvaluacionSection` — `src/components/reportes/sections/EvaluacionSection.tsx`

Carrusel de calificación por áreas de responsabilidad. Muestra una área a la vez.

**Comportamiento:**
- Carga áreas desde `GET /api/areas` (filtra "General")
- Muestra una tarjeta por área con `StarRating` 1–5
- Al seleccionar una calificación, avanza automáticamente 380ms después
- Botón/swipe **Siguiente** bloqueado si el área actual no tiene calificación
- Botón/swipe **Anterior** siempre disponible
- Dots de progreso en la parte superior: activo (ancho), calificado (color), pendiente (gris)
- Guarda los valores como `evaluacion.area_{id}`

---

### `StarRating` — `src/components/reportes/StarRating.tsx`

Input de calificación 1–5 con íconos `Star` de Lucide.

**Props:**
```typescript
{
  value: number           // 0-5 (0 = sin calificar)
  onChange: (n: number) => void
  disabled?: boolean
}
```

---

### `InfoGeneralSection` — `src/components/reportes/sections/InfoGeneralSection.tsx`

Campos: `nombreSolicitante`, `fechaInspeccion`.

---

### `ComentariosSection` — `src/components/reportes/sections/ComentariosSection.tsx`

Campo: `descripcion` (textarea opcional).

---

### `FormSectionHeader` — `src/components/reportes/FormSectionHeader.tsx`

Encabezado de sección con ícono, título, descripción y separador.

**Props:**
```typescript
{
  icon: LucideIcon
  title: string
  description?: string
}
```

---

## Vista Detalle del Reporte

### `ReporteHeader` — `src/components/detalle/ReporteHeader.tsx`

Encabezado con número de reporte, `StatusBadge` y timestamps.

---

### `InfoGrid` — `src/components/detalle/InfoGrid.tsx`

Grid con datos básicos: solicitante, fecha, tipo de ubicación, edificio y espacio.

---

### `EvaluacionChecklist` — `src/components/detalle/EvaluacionChecklist.tsx`

Renderiza las calificaciones guardadas en el JSON `evaluacion` del reporte.

**Props:**
```typescript
{
  evaluacion: Record<string, number> | null
  areas: { id: number; nombre: string }[]
}
```

**Comportamiento:**
- Para cada área con calificación > 0 en `evaluacion`:
  - Muestra el nombre del área con su ícono
  - Muestra las estrellas rellenas (de 5)
  - Muestra etiqueta según calificación: 4–5 = "Bueno" (verde), 3 = "Regular" (amber), 1–2 = "Deficiente" (rojo)
- Si no hay áreas calificadas → "Sin evaluación registrada"

---

### `EstadoSidebar` — `src/components/detalle/EstadoSidebar.tsx`

Panel lateral de gestión. Client Component.

**Comportamiento:**
- Muestra estado actual con `StatusBadge`
- ADMIN/TECNICO: botones para avanzar el estado del reporte
- Al hacer clic → abre `AsignarTareaModal`
- Si el reporte tiene datos de atención, muestra tarjeta con área, fechas y observaciones

---

### `AsignarTareaModal` — `src/components/detalle/AsignarTareaModal.tsx`

Dialog para gestionar el estado de un reporte.

**Campos:**
- Área responsable (Select con áreas del sistema)
- Personal responsable (Select filtrado por área)
- Observaciones técnicas (Textarea)

**Al enviar:** `PATCH /api/reportes/[id]` → `router.refresh()`

---

### `BitacoraPanel` — `src/components/detalle/BitacoraPanel.tsx`

Tabla de auditoría con el historial de acciones del reporte. Solo visible para ADMIN.

---

## Componentes UI compartidos

### `StatusBadge`

Badge con color según el estado del reporte.

| Estado | Color |
|---|---|
| PENDIENTE | Amber |
| EN_PROCESO | Azul |
| ATENDIDO | Esmeralda |

---

## shadcn/ui instalados

Componentes primitivos disponibles en `src/components/ui/`:

`alert` · `avatar` · `badge` · `breadcrumb` · `button` · `calendar` · `card` · `dialog` · `dropdown-menu` · `form` · `input` · `label` · `popover` · `select` · `separator` · `sheet` · `skeleton` · `switch` · `table` · `textarea` · `tooltip`
