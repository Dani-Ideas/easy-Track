# Arquitectura del Proyecto

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.1 |
| Lenguaje | TypeScript | 5.x |
| Base de datos | MySQL 8 (Docker) | 8.x |
| ORM | Prisma | 6.x |
| Autenticación | NextAuth.js v5 beta | 5.0.0-beta.30 |
| Estado global | Zustand (con persist) | 5.x |
| Formularios | react-hook-form + Zod | 7.x / 4.x |
| UI Components | shadcn/ui (new-york, neutral) | — |
| Styling | Tailwind CSS v4 | 4.x |
| Iconos | Lucide React | 1.x |
| Tema | next-themes (class strategy) | 0.4.x |
| Exportación | xlsx (SheetJS) | 0.18.x |
| Contenedores | Docker Compose | — |

## Módulos del sistema

El sistema está dividido en tres módulos de responsabilidad, cada uno desarrollado en su propia rama Git:

### Módulo 1 — Registro de Incidencias (`rama: registro`)
Formulario de inspección con validación completa:
- **LocationPicker**: selector de ubicación en 3 pasos (tipo → edificio/bloque → espacio específico)
- **EvaluacionSection**: carrusel de calificación 1–5 por área de responsabilidad, avance automático al seleccionar
- **ComentariosSection**: campo de texto libre para observaciones del solicitante
- Validación con `react-hook-form` + `zodResolver`; datos enviados a `POST /api/reportes`

### Módulo 2 — Gestión Administrativa y Seguimiento (`rama: seguimiento`)
Control del ciclo de vida de cada reporte:
- **AsignarTareaModal**: asigna área responsable, personal y observaciones técnicas
- Cambio de estado `PENDIENTE → EN_PROCESO → ATENDIDO` con timestamps automáticos
- **BitacoraPanel**: historial de auditoría completo (solo visible para ADMIN)
- Filtros por estado, tipo de ubicación y rango de fechas en la tabla del dashboard

### Módulo 3 — Análisis y Gestión Estratégica (`rama: panel`)
Métricas y exportación:
- **StatsGrid**: conteos de reportes por estado en tiempo real
- **DashboardClient**: tabla paginada y reactiva a filtros sin recarga de página
- **ExportButton**: exporta reportes filtrados a Excel (`.xlsx`) con SheetJS
- Página `/analiticas` con métricas por edificio y tiempo promedio de atención

---

## Estructura de directorios

```
faciltrack/
├── prisma/
│   ├── schema.prisma          # Schema de la base de datos
│   └── seed.ts                # Datos de prueba: tipos, grupos, espacios y usuarios
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Rutas sin sidebar (login)
│   │   │   └── login/
│   │   ├── (dashboard)/       # Rutas con sidebar + header (requieren auth)
│   │   │   ├── layout.tsx     # AppShell: sidebar + header
│   │   │   ├── dashboard/     # Panel principal con métricas y tabla
│   │   │   ├── reportes/
│   │   │   │   ├── nuevo/     # Formulario de inspección
│   │   │   │   └── [id]/      # Detalle del reporte
│   │   │   ├── edificios/     # Gestión de grupos y espacios
│   │   │   ├── personal/      # Gestión de personal técnico
│   │   │   └── analiticas/    # Gráficas y estadísticas
│   │   ├── api/               # API Routes
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── reportes/
│   │   │   ├── areas/
│   │   │   ├── espacios/
│   │   │   ├── grupos/
│   │   │   ├── tipos-espacio/
│   │   │   └── personal/
│   │   ├── layout.tsx         # Root layout: ThemeProvider, fuentes
│   │   ├── page.tsx           # Redirige a /dashboard
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                # Primitivos shadcn/ui
│   │   ├── layout/            # Sidebar, Header, Breadcrumb, ThemeToggle
│   │   ├── dashboard/         # StatsGrid, ReportsTable, filtros, paginación
│   │   ├── reportes/          # Formulario de inspección y secciones
│   │   └── detalle/           # Vista de detalle del reporte
│   │
│   ├── lib/
│   │   ├── auth.ts            # Configuración NextAuth (Node.js)
│   │   ├── prisma.ts          # Singleton del cliente Prisma
│   │   ├── utils.ts           # Función cn() de Tailwind
│   │   ├── validations/       # Schemas Zod
│   │   └── utils/             # Utilidades (fechas, export, estados)
│   │
│   ├── store/                 # Stores Zustand
│   ├── types/                 # Augmentación de tipos TypeScript
│   └── generated/             # Código generado por Prisma (no editar)
│
├── auth.config.ts             # Config NextAuth edge-safe (sin Prisma)
├── middleware.ts              # Protección de rutas
├── prisma.config.ts           # Config Prisma 6 (datasource, migrations path)
├── Dockerfile                 # Imagen de producción
├── docker-compose.yml         # MySQL + app Next.js
├── entrypoint.sh              # Script de inicio: db push → seed → next start
└── .env / .env.example
```

---

## Decisiones de arquitectura

### Route Groups

- `(auth)` — rutas sin layout de app (solo el login)
- `(dashboard)` — rutas con AppShell (sidebar + header), todas protegidas por middleware

### NextAuth v5 — split de configuración

NextAuth v5 beta requiere separar la configuración para soportar el Edge Runtime en el middleware:

```
auth.config.ts        ← Edge-safe: callbacks de JWT/session, páginas, authorized()
src/lib/auth.ts       ← Node.js only: PrismaAdapter, Credentials provider (bcrypt)
middleware.ts         ← Usa auth.config.ts para proteger rutas sin importar Node.js
```

### Prisma 6 — cliente generado en path personalizado

Prisma 6 genera el cliente en una ruta custom definida en `prisma.config.ts`. La importación correcta es:

```typescript
import { PrismaClient } from "@/generated/prisma/client";
// NO usar: import { PrismaClient } from "@prisma/client"
```

### Evaluación como JSON — áreas de responsabilidad

El campo `evaluacion` del reporte almacena un objeto JSON con la calificación (1–5) de cada área de responsabilidad:

```typescript
// Estructura del campo evaluacion
{
  "area_1": 4,   // id del área → calificación
  "area_2": 3,
  "area_5": 5,
  // Solo las áreas que el usuario calificó (> 0)
}
```

Esto permite que los criterios se gestionen desde la tabla `Area` sin requerir migraciones de schema cuando se añadan o cambien áreas.

### Docker — arranque automático

El `entrypoint.sh` garantiza que la DB esté lista antes de arrancar la app:

```
docker compose up
  ├── db (MySQL 8) — healthcheck cada 5s
  └── app — espera db_healthy, luego:
        ├── prisma db push   (crea/actualiza tablas)
        ├── npm run db:seed  (seed idempotente: omite si ya hay usuarios)
        └── next start
```

### Seed idempotente

El seed verifica si ya existen usuarios antes de insertar datos. Esto permite reiniciar el contenedor sin perder datos, y también permite hacer `docker compose down -v && docker compose up` para un reset limpio.

---

## Flujo de peticiones HTTP

### Rutas de API (`/api/*`) — bypass de middleware

```
Navegador
  │ GET http://localhost:3000/api/reportes?page=1
  ▼
Docker port mapping 3000:3000
  ▼
Node.js (next start) — servidor HTTP dentro del contenedor
  │
  │ middleware.ts ← SKIP (matcher excluye /api/*)
  │
  ▼ src/app/api/reportes/route.ts → función GET()
       ├── auth()          → verifica JWT en cookie (sin BD)   [src/lib/auth.ts]
       ├── prisma.user.*   → consulta MySQL db:3306             [red interna Docker]
       ├── prisma.reporte.*→ SELECT + COUNT en paralelo         [red interna Docker]
       └── NextResponse.json({ data, total, page, pageSize })
  ▼
Navegador recibe JSON → React re-renderiza la tabla
```

### Rutas de página (`/dashboard`, `/reportes`, etc.) — pasan por middleware

```
Navegador
  │ GET http://localhost:3000/dashboard
  ▼
middleware.ts
  └── auth.config.ts → authorized()
       ├── Sin sesión → redirect /login   (Edge Runtime, sin Node.js)
       └── Con sesión → continúa
  ▼
src/app/layout.tsx           → ThemeProvider, fuentes (todas las rutas)
src/app/(dashboard)/layout.tsx → segunda verificación auth(), Sidebar, Header
src/app/(dashboard)/dashboard/page.tsx → Server Component con Prisma directo
```

**Por qué dos verificaciones de sesión:** `middleware.ts` corre en Edge Runtime (V8 sin Node.js completo), no puede usar Prisma ni bcrypt. El layout corre en Node.js con acceso completo y es la barrera definitiva.

### Comunicación entre contenedores

```
Tu laptop (host)                  Red interna Docker
────────────────                  ──────────────────────────────
localhost:3000 ──────────────────▶ app:3000  (Node.js)
                                       │
localhost:3307 ──────────────────▶ db:3306   (MySQL)
(solo para Prisma Studio)              ▲
                                       │ db:3306 (nunca usa 3307)
                                   app:3000 ──────────────────────┘
```

El contenedor `app` se conecta a MySQL usando `db:3306` directamente — Docker resuelve `db` mediante su DNS interno. El puerto `3307` solo existe en el host para herramientas externas (Prisma Studio, clientes MySQL).

---

## Estrategia de control de versiones

El proyecto usa un flujo de ramas por módulo/equipo:

```
main          ← producción estable
  └── Develop ← rama de integración (branch base para PRs)
        ├── DB          ← schema Prisma, seed, migraciones
        ├── registro    ← Módulo 1: formulario de inspección
        ├── panel       ← Módulo 3: dashboard y analíticas
        └── seguimiento ← Módulo 2: gestión y bitácora
```

Cada equipo trabajó en su rama y abrió un PR hacia `Develop`. Los merges en `Develop` están registrados en el historial:

```
merge(Develop): integrar seguimiento — asignación manual y bitácora
merge(Develop): integrar panel — dashboard final, Personal, Edificios, Analíticas
merge(Develop): integrar módulo de registro — formulario con LocationPicker
merge(Develop): integrar sprint de BD — schema, roles, APIs de personal y middleware
```

---

## Flujo de datos — Dashboard

```
DashboardPage (Server Component)
  ├── getStats() → Prisma directo → StatsGrid
  └── <DashboardClient /> (Client Component)
        ├── useUIStore (filtros reactivos)
        ├── useEffect → fetch /api/reportes?filtros
        ├── → ReportsTable
        └── → TablePagination
```

## Flujo de datos — Formulario de inspección

```
/reportes/nuevo (Server Component)
  └── <ReporteForm /> (Client Component)
        ├── react-hook-form + zodResolver
        ├── <LocationPicker />     → fetch /api/tipos-espacio, /api/grupos, /api/espacios
        ├── <EvaluacionSection />  → fetch /api/areas → carrusel de StarRating por área
        ├── <ComentariosSection />
        └── onSubmit → POST /api/reportes → redirect /reportes/[id]
```

## Flujo de datos — Detalle del reporte

```
/reportes/[id] (Server Component)
  ├── prisma.reporte.findUnique()  → datos del reporte
  ├── prisma.area.findMany()       → para EvaluacionChecklist
  ├── <ReporteHeader />, <InfoGrid />, <EvaluacionChecklist />
  └── <EstadoSidebar /> (Client Component)
        ├── <AsignarTareaModal />
        │     └── PATCH /api/reportes/[id]
        └── router.refresh()
```
