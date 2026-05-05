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
DATABASE_URL="mysql://faciltrack:faciltrack@localhost:3306/faciltrack"

# NextAuth v5
AUTH_SECRET="genera-con: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

```

## Configuración de la base de datos

```bash
# 1. Levantar MySQL con Docker
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

El archivo `docker-compose.yml` levanta un contenedor MySQL 8:

```yaml
services:
  db:
    image: mysql:8
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: faciltrack
      MYSQL_USER: faciltrack
      MYSQL_PASSWORD: faciltrack
      MYSQL_DATABASE: faciltrack
    volumes:
      - mysqldata:/var/lib/mysql
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
