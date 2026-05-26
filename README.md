# FacilTrack

Sistema web de gestión y control de reportes de inspección de instalaciones físicas (aulas, laboratorios, sanitarios, áreas comunes).

## Inicio rápido — Docker (todo en un comando)

```bash
# Primera vez: construye la imagen, levanta MySQL y Next.js
docker compose up --build

# Reinicios posteriores (imagen ya construida)
docker compose up
```

La aplicación estará en **http://localhost:3000**. Docker se encarga de todo: levanta la base de datos, crea las tablas e inserta los datos de prueba antes de arrancar la app.

### Credenciales de prueba (contraseña: `123456` para todos)

| Email | Rol |
|---|---|
| `admin@faciltrack.local` | ADMIN |
| `jefe.mantenimiento.general@faciltrack.local` | STAFF |
| `tecnico.mantenimiento.general@faciltrack.local` | TECNICO |
| `jefe.electricidad@faciltrack.local` | STAFF |
| `tecnico.electricidad@faciltrack.local` | TECNICO |
| `jefe.plomeria@faciltrack.local` | STAFF |
| `tecnico.plomeria@faciltrack.local` | TECNICO |
| `jefe.limpieza@faciltrack.local` | STAFF |
| `tecnico.limpieza@faciltrack.local` | TECNICO |
| `jefe.infraestructura@faciltrack.local` | STAFF |
| `tecnico.infraestructura@faciltrack.local` | TECNICO |
| `jefe.tecnologia@faciltrack.local` | STAFF |
| `tecnico.tecnologia@faciltrack.local` | TECNICO |

### Resetear la base de datos

```bash
docker compose down -v   # borra el volumen → DB vacía
docker compose up        # re-seed automático al arrancar
```

---

## Desarrollo local (DB en Docker, app en local)

Este es el modo recomendado para desarrollar: hot-reload nativo, sin reconstruir imagen.

```bash
# 1. Levantar solo MySQL
docker compose up db -d

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp .env.example .env
# Editar .env y completar AUTH_SECRET (ver .env.example)

# 4. Sincronizar schema y seed
npm run db:push
npm run db:seed

# 5. Servidor de desarrollo
npm run dev
```

Abre http://localhost:3000.

> **Nota:** `npm run dev` requiere que el contenedor `db` esté corriendo (`docker compose up db -d`). Si la DB no está disponible, Next.js mostrará un error `Can't reach database server at localhost:3307`.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.1 (App Router, Turbopack) |
| Lenguaje | TypeScript 5 |
| Base de datos | MySQL 8 (Docker) |
| ORM | Prisma 6 |
| Autenticación | NextAuth.js v5 beta |
| Formularios | react-hook-form + Zod 4 |
| UI | shadcn/ui + Tailwind CSS v4 |
| Estado global | Zustand 5 |
| Contenedores | Docker Compose |

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en `localhost:3000` |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción (requiere build previo) |
| `npm run db:push` | Sincronizar schema Prisma con la BD |
| `npm run db:seed` | Insertar datos de prueba |
| `npm run db:studio` | Abrir Prisma Studio (GUI visual de la BD) |
| `npm run db:generate` | Regenerar el cliente Prisma |

---

## Documentación

| Archivo | Contenido |
|---|---|
| [`Documentation/guia-inicio.md`](Documentation/guia-inicio.md) | Instalación detallada y configuración |
| [`Documentation/arquitectura.md`](Documentation/arquitectura.md) | Stack, estructura de directorios, decisiones de diseño |
| [`Documentation/base-de-datos.md`](Documentation/base-de-datos.md) | Schema, modelos y relaciones |
| [`Documentation/autenticacion.md`](Documentation/autenticacion.md) | NextAuth v5, roles y middleware |
| [`Documentation/api.md`](Documentation/api.md) | Referencia de endpoints |
| [`Documentation/componentes.md`](Documentation/componentes.md) | Catálogo de componentes React |
