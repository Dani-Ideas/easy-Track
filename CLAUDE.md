# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint

npm run db:push      # Push schema changes to the database (no migration file)
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:seed      # Seed initial data (users, building groups, spaces, facility types)
npm run db:studio    # Open Prisma Studio GUI
```

No test framework is configured.

## Environment

Copy `.env.example` to `.env.local`. Required variables:

- `DATABASE_URL` — MySQL connection string (`mysql://user:pass@localhost:3306/faciltrack`)
- `AUTH_SECRET` — generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth 2.0 credentials (see planned migration below)

## Architecture

**FacilTrack** is a facilities inspection/report management system for schools. Staff create reports for spaces (rooms, bathrooms, labs) inside buildings, rate them, and upload photos. Technicians resolve reports. Admins manage everything.

### Route groups

```
src/app/
  (auth)/login/          # Public login page
  (dashboard)/           # Protected by middleware — all main app pages
    dashboard/           # Stats overview
    reportes/            # Report list, nuevo/ (create), [id]/ (detail)
    edificios/           # Buildings & spaces management
    personal/            # User management
    analiticas/          # Charts & exports
  api/                   # REST endpoints (reportes, espacios, grupos, tipos-espacio, stats)
```

### Auth flow (current — NextAuth v5)

Two config files cooperate:
- `auth.config.ts` — callbacks (JWT enrichment with `role`/`id`, session shape, protected-path check), sign-in page at `/login`
- `src/lib/auth.ts` — full NextAuth config with Prisma adapter + Credentials provider (bcrypt verify)
- `middleware.ts` — runs the auth check on every non-static request; redirects unauthenticated users to `/login`

Roles: `STAFF`, `ADMIN`, `TECNICO` (stored on the User model, passed through JWT into `session.user`).

### Planned auth migration → Google OAuth 2.0 standard

**When instructed**, replace NextAuth v5 with standard Google OAuth 2.0. Files that will need to change:

| File | Change needed |
|---|---|
| `auth.config.ts` | Remove — NextAuth-specific |
| `src/lib/auth.ts` | Replace with Google OAuth 2.0 token exchange logic |
| `middleware.ts` | Replace NextAuth session check with cookie/JWT verification |
| `src/app/api/auth/[...nextauth]/route.ts` | Remove — replace with `/api/auth/google` + `/api/auth/callback/google` routes |
| `prisma/schema.prisma` | Drop `Account`, `Session`, `VerificationToken` models; keep `User` (remove `password`) |
| `src/types/next-auth.d.ts` | Remove — replace with custom session type |
| `package.json` | Remove `next-auth`, `@auth/prisma-adapter`, `bcryptjs`; add `google-auth-library` |

Google OAuth flow to implement: redirect → Google consent → callback receives `code` → exchange for `id_token` → verify with `google-auth-library` → upsert User by `email` → issue signed session cookie (restrict to `@<domain>.com` if needed).

### Data model highlights

`Reporte` is the core entity:
- `estado`: `PENDIENTE | EN_PROCESO | ATENDIDO`
- `evaluacion`: JSON `{ limpieza: 1–5, seguridad: 1–5, iluminacion: bool, equipo: bool }`
- `isDraft`: report is saved locally then submitted; drafts are excluded from most queries

Space hierarchy: `Grupo` (building) → `Espacio` (room) → `TipoEspacio` (category like "Aula", "Baño").

> **MySQL note:** `urlImagenes String[]` (array field) is not supported by MySQL. Before the next `db:push`, convert it to a `Json` field or a separate `ReporteImagen` table.

### State & forms

- **React Hook Form + Zod** for all forms. Schemas live in `src/lib/validations/`.
- **Zustand** (`src/store/useReporteFormStore.ts`) persists the in-progress report form to `localStorage` so draft data survives page refreshes.

### UI components

`src/components/ui/` contains shadcn/ui primitives (Radix UI + Tailwind CSS 4). Import them from `@/components/ui/<name>`. The base color is neutral; dark mode is handled via `next-themes`.

### Path alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).
