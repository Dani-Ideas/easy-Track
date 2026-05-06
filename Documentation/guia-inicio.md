# Guía de Inicio

## Requisitos previos

- Node.js 20+
- Docker y Docker Compose
- npm

## Instalación

```bash
# Clonar o acceder al directorio del proyecto
cd /home/robute/Documentos/codes/faciltrack

# Instalar dependencias
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

### `.env` — variables requeridas

```env
# Base de datos (Docker local)
DATABASE_URL="postgresql://faciltrack:faciltrack@localhost:5432/faciltrack"

# NextAuth v5
AUTH_SECRET="genera-con: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (opcional en desarrollo)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
```

> **Cloudinary es opcional en desarrollo.** Si no se configura, las imágenes subidas se previsualizan localmente con `URL.createObjectURL()` pero no se persisten.

## Configuración de la base de datos

```bash
# 1. Levantar PostgreSQL con Docker
docker compose up -d

# 2. Verificar que el contenedor esté corriendo
docker ps

# 3. Aplicar el schema al base de datos
npm run db:push

# 4. Cargar datos de prueba (tipos, edificios, espacios y usuarios)
npm run db:seed
```

### Usuarios creados por el seed

| Email | Contraseña | Rol |
|---|---|---|
| `admin@faciltrack.local` | `admin123` | ADMIN |
| `staff@faciltrack.local` | `staff123` | STAFF |
| `tecnico@faciltrack.local` | `tecnico123` | TECNICO |

## Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre `http://localhost:3000`. La raíz redirige automáticamente a `/dashboard`.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en `localhost:3000` |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción (requiere build previo) |
| `npm run lint` | Ejecutar ESLint |
| `npm run db:push` | Sincronizar schema Prisma con la base de datos |
| `npm run db:seed` | Cargar datos de prueba |
| `npm run db:studio` | Abrir Prisma Studio (interfaz visual de la BD) |
| `npm run db:generate` | Regenerar el cliente Prisma |

## Docker Compose

El archivo `docker-compose.yml` levanta un contenedor PostgreSQL 16:

```yaml
services:
  db:
    image: postgres:16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: faciltrack
      POSTGRES_PASSWORD: faciltrack
      POSTGRES_DB: faciltrack
    volumes:
      - pgdata:/var/lib/postgresql/data
```

### Comandos útiles de Docker

```bash
# Iniciar contenedor en segundo plano
docker compose up -d

# Detener contenedor
docker compose down

# Detener y eliminar volúmenes (borra la base de datos)
docker compose down -v

# Ver logs del contenedor
docker compose logs db
```

## Regenerar el cliente Prisma

Después de modificar `prisma/schema.prisma`:

```bash
npm run db:push        # Aplica cambios a la BD
npm run db:generate    # Regenera los tipos TypeScript
```

El cliente generado se encuentra en `src/generated/prisma/`.
