# Base de Datos

Motor: **MySQL 8** vía Docker Compose.

Conexión local: `mysql://faciltrack:faciltrack@localhost:3307/faciltrack`
Conexión en contenedor: `mysql://faciltrack:faciltrack@db:3306/faciltrack`

---

## Diagrama de relaciones

```
TipoEspacio         Grupo
    │                 │
    └────┐     ┌──────┘
         ▼     ▼
        Espacio ──────────────────────────► Reporte ◄─── User
                                                │            │
                                           LogAccion       Area
                                                │            │
                                           Personal ────────┘
User ──── Area
 │
 ├── Account   (NextAuth)
 └── Session   (NextAuth)
```

---

## Modelos

### User

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | String (cuid) | PK |
| `name` | String? | Nombre del usuario |
| `email` | String (unique) | Correo electrónico |
| `password` | String? | Hash bcrypt |
| `role` | Role | STAFF, ADMIN o TECNICO |
| `areaId` | Int? | FK → Area (área de responsabilidad) |

**Enum Role:**
```
STAFF    → Jefe de área: crea reportes, consulta el panel
ADMIN    → Administrador: acceso completo, asigna personal, cambia estados
TECNICO  → Técnico: ve y atiende reportes asignados a su área
```

---

### Area

Áreas de responsabilidad del plantel.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int (autoincrement) | PK |
| `nombre` | String (unique) | Nombre del área |
| `activo` | Boolean | Por defecto true |

**Datos del seed:**
- General
- Mantenimiento General
- Electricidad
- Plomería
- Limpieza
- Infraestructura
- Tecnología

---

### TipoEspacio

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int | PK |
| `nombre` | String | Nombre del tipo |
| `categoriaEvaluacion` | CategoriaEvaluacion | SALONES, SANITARIOS o AREAS_COMUNES |

**Datos del seed:**

| id | Nombre | Categoría |
|---|---|---|
| 1 | Aula | SALONES |
| 2 | Laboratorio | SALONES |
| 3 | Taller | SALONES |
| 4 | Servicio Sanitario | SANITARIOS |
| 5 | Área Administrativa | SALONES |
| 6 | Área Común | AREAS_COMUNES |

---

### Grupo

Edificios o bloques que agrupan espacios.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int | PK |
| `nombre` | String | Nombre del edificio/bloque |

**27 grupos en el seed:** Bloque J, Bloque A1–A11, Bloque PG, Centro Tecnológico, 4 laboratorios, Área de Medios, Servicios Sanitarios, edificios administrativos, Centro Integral, Zonas Comunes.

---

### Espacio

Espacio físico específico dentro de un grupo.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int | PK |
| `espacio` | String | Nombre del espacio (ej. "B1-001") |
| `piso` | String? | Planta (ej. "1er Piso") |
| `idGrupo` | Int (FK) | → Grupo |
| `idTipoEspacio` | Int (FK) | → TipoEspacio |

**436 espacios en el seed.**

---

### Personal

Técnicos del plantel asociados a un área.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int | PK |
| `nombre` | String | Nombre completo |
| `nombreNorm` | String (unique) | Nombre normalizado (para búsquedas) |
| `areaId` | Int? (FK) | → Area |
| `rol` | Role? | STAFF, ADMIN o TECNICO |

---

### Reporte

Modelo central del sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int | PK |
| `fechaCreacion` | DateTime | Timestamp automático |
| `fechaInspeccion` | DateTime | Fecha elegida en el formulario |
| `nombreSolicitante` | String (50) | Quien hace el reporte |
| `tipoUbicacion` | String (50) | Nombre del tipo de espacio |
| `idEspacio` | Int (FK) | → Espacio |
| `descripcion` | String? (500) | Comentarios |
| `estado` | EstadoReporte | PENDIENTE, EN_PROCESO o ATENDIDO |
| `areaResponsable` | String? (50) | Área asignada |
| `observaciones` | String? (500) | Notas técnicas |
| `fechaAtencion` | DateTime? | Cuándo inició la atención |
| `fechaResolucion` | DateTime? | Cuándo se marcó como resuelto |
| `evaluacion` | Json? | Calificaciones por área (ver estructura) |
| `isDraft` | Boolean | true si no fue enviado |
| `creadoPorId` | String? (FK) | → User |
| `personalResponsableId` | Int? (FK) | → Personal |

**Enum EstadoReporte:**
```
PENDIENTE  → Recién creado
EN_PROCESO → Atención iniciada (registra fechaAtencion)
ATENDIDO   → Resuelto (registra fechaResolucion)
```

**Estructura del campo `evaluacion` (JSON):**
```json
{
  "area_1": 4,
  "area_3": 5,
  "area_4": 2
}
```
Las claves son `area_{id}` donde `id` es el `Area.id`. Los valores son enteros 1–5. Solo se guardan las áreas que el usuario calificó (> 0).

---

### LogAccion

Bitácora de auditoría. Cada acción relevante (cambio de estado, asignación, etc.) genera un registro.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int | PK |
| `createdAt` | DateTime | Timestamp automático |
| `usuarioLogin` | String | Email del usuario autenticado |
| `usuarioReal` | String? | Nombre del usuario |
| `accion` | String | Descripción de la acción |
| `detalle` | String? | Detalle adicional |
| `ip` | String? | IP del cliente |
| `dispositivo` | String? | User-Agent |
| `areaId` | Int? (FK) | → Area |
| `reporteId` | Int? (FK) | → Reporte |

---

## Transiciones de estado

```
PENDIENTE ──► EN_PROCESO ──► ATENDIDO
```

Al pasar a `EN_PROCESO` → `fechaAtencion = now()`
Al pasar a `ATENDIDO` → `fechaResolucion = now()`

---

## Comandos de base de datos

```bash
# Aplicar schema (desarrollo — sin migraciones)
npm run db:push

# Regenerar el cliente Prisma tras cambios en schema
npm run db:generate

# Abrir Prisma Studio (GUI visual)
npm run db:studio

# Ejecutar seed manualmente
npm run db:seed

# Consola MySQL directa
docker exec -it faciltrack-db-1 mysql -u faciltrack -pfaciltrack faciltrack
```
