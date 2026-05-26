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
