# FaciliTrack — Documentación del Proyecto

Sistema de gestión de reportes de instalaciones escolares.

## Índice

| Documento | Descripción |
|---|---|
| [Arquitectura](./arquitectura.md) | Estructura del proyecto, stack tecnológico y decisiones de diseño |
| [Base de Datos](./base-de-datos.md) | Modelos, relaciones y esquema Prisma |
| [API](./api.md) | Referencia de todos los endpoints REST |
| [Componentes](./componentes.md) | Catálogo de componentes React por sección |
| [Autenticación](./autenticacion.md) | Flujo de auth, roles y protección de rutas |
| [Guía de Inicio](./guia-inicio.md) | Setup local, variables de entorno y comandos |

---

## Inicio rápido

```bash
# 1. Levantar base de datos
docker compose up -d

# 2. Aplicar schema y datos de prueba
npm run db:push
npm run db:seed

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abrir `http://localhost:3000` → redirige a `/dashboard`.

**Cuenta de prueba:** `admin@faciltrack.local` / `admin123`

---

## Páginas principales

| Ruta | Descripción |
|---|---|
| `/login` | Página de inicio de sesión |
| `/dashboard` | Panel principal con estadísticas y tabla de reportes |
| `/reportes/nuevo` | Formulario de inspección para crear reportes |
| `/reportes/[id]` | Detalle del reporte con gestión de estado |
| `/edificios` | Gestión de edificios *(próximamente)* |
| `/personal` | Gestión de personal *(próximamente)* |
| `/analiticas` | Analíticas y gráficas *(próximamente)* |
