# Guía de Inicio

## Inicio Rápido

Un solo comando levanta todo el sistema (base de datos + aplicación + seed):

```bash
docker compose up --build
```

Abre **http://localhost:3000**. Usa cualquier credencial de la tabla de [credenciales de prueba](#credenciales-de-prueba).

Para resetear completamente (borra todos los datos y vuelve a hacer seed):

```bash
docker compose down -v && docker compose up
```

> **Requisito único:** tener Docker instalado. No se necesita Node.js para este modo.

---

## Requisitos previos

- Docker y Docker Compose (requerido en ambos modos)
- Node.js 20+ y npm (solo para desarrollo local)

---

## Modo 1 — Docker completo (recomendado para demo/pruebas)

Levanta MySQL + Next.js en contenedores. No requiere Node.js local.

```bash
docker compose up --build
```

Docker se encarga de todo automáticamente: levanta MySQL, espera a que esté listo, crea las tablas, inserta los datos de prueba y arranca la aplicación.

**Acceso:** http://localhost:3000

Para resetear completamente (borra todos los datos):
```bash
docker compose down -v
docker compose up
```

---

## Modo 2 — Desarrollo local (DB en Docker, app en local)

MySQL corre en Docker; Next.js corre en local con hot-reload.

```bash
# 1. Levantar solo la base de datos
docker compose up db -d

# 2. Instalar dependencias
npm install

# 3. Variables de entorno
cp .env.example .env
```

Editar `.env` y completar `AUTH_SECRET`:

```env
DATABASE_URL="mysql://faciltrack:faciltrack@localhost:3307/faciltrack"
AUTH_SECRET="genera-con: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
```

```bash
# 4. Crear tablas
npm run db:push

# 5. Insertar datos de prueba
npm run db:seed

# 6. Servidor de desarrollo
npm run dev
```

**Acceso:** http://localhost:3000

> El servidor de desarrollo falla con `Can't reach database server at localhost:3307` si el contenedor `db` no está corriendo. Asegúrate de ejecutar `docker compose up db -d` antes de `npm run dev`.

---

## Credenciales de prueba

Contraseña `123456` para todos los usuarios.

| Email | Rol | Área |
|---|---|---|
| `admin@faciltrack.local` | ADMIN | General |
| `jefe.mantenimiento.general@faciltrack.local` | STAFF | Mantenimiento General |
| `tecnico.mantenimiento.general@faciltrack.local` | TECNICO | Mantenimiento General |
| `jefe.electricidad@faciltrack.local` | STAFF | Electricidad |
| `tecnico.electricidad@faciltrack.local` | TECNICO | Electricidad |
| `jefe.plomeria@faciltrack.local` | STAFF | Plomería |
| `tecnico.plomeria@faciltrack.local` | TECNICO | Plomería |
| `jefe.limpieza@faciltrack.local` | STAFF | Limpieza |
| `tecnico.limpieza@faciltrack.local` | TECNICO | Limpieza |
| `jefe.infraestructura@faciltrack.local` | STAFF | Infraestructura |
| `tecnico.infraestructura@faciltrack.local` | TECNICO | Infraestructura |
| `jefe.tecnologia@faciltrack.local` | STAFF | Tecnología |
| `tecnico.tecnologia@faciltrack.local` | TECNICO | Tecnología |

---

## Comandos Docker útiles

```bash
# Solo la DB en segundo plano (modo desarrollo)
docker compose up db -d

# Todo el stack en segundo plano
docker compose up -d

# Ver logs de la aplicación
docker compose logs app -f

# Ver logs de la base de datos
docker compose logs db -f

# Detener sin borrar datos
docker compose down

# Detener y borrar volúmenes (reset completo)
docker compose down -v

# Abrir Prisma Studio (requiere DB corriendo)
npm run db:studio
# o conectar directamente con MySQL
docker exec -it faciltrack-db-1 mysql -u faciltrack -pfaciltrack faciltrack
```

---

## Scripts npm disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción (requiere build previo) |
| `npm run db:push` | Sincronizar schema Prisma con la BD |
| `npm run db:seed` | Insertar datos de prueba |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:generate` | Regenerar el cliente Prisma |

---

## Regenerar el cliente Prisma

Después de modificar `prisma/schema.prisma`:

```bash
npm run db:push        # Aplica cambios a la BD
npm run db:generate    # Regenera los tipos TypeScript
```

El cliente generado se encuentra en `src/generated/prisma/` (no editar).
