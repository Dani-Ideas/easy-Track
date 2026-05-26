# API Reference

Todos los endpoints requieren sesión activa. Las peticiones sin sesión retornan `401 Unauthorized`.

Base URL en desarrollo: `http://localhost:3000/api`

---

## Reportes

### `GET /api/reportes`

Lista paginada de reportes enviados (`isDraft: false`).

**Query params:**

| Param | Tipo | Descripción |
|---|---|---|
| `estado` | `PENDIENTE` \| `EN_PROCESO` \| `ATENDIDO` | Filtrar por estado |
| `tipoUbicacion` | string | Filtrar por tipo de ubicación |
| `fechaDesde` | `YYYY-MM-DD` | Fecha mínima de creación |
| `fechaHasta` | `YYYY-MM-DD` | Fecha máxima de creación |
| `page` | number | Página (default: 1) |
| `pageSize` | number | Registros por página (default: 10, max: 50) |

**Respuesta:**
```json
{
  "data": [
    {
      "id": 1,
      "fechaCreacion": "2026-05-01T10:00:00.000Z",
      "fechaInspeccion": "2026-05-01T00:00:00.000Z",
      "nombreSolicitante": "María García",
      "tipoUbicacion": "Aula",
      "estado": "PENDIENTE",
      "descripcion": "Luminaria dañada",
      "espacio": {
        "espacio": "B1-001",
        "grupo": { "nombre": "Bloque A1" },
        "tipoEspacio": { "nombre": "Aula" }
      }
    }
  ],
  "total": 48,
  "page": 1,
  "pageSize": 10
}
```

---

### `POST /api/reportes`

Crea un nuevo reporte.

**Body:**
```json
{
  "nombreSolicitante": "María García",
  "fechaInspeccion": "2026-05-01",
  "tipoUbicacion": "Aula",
  "idEspacio": 15,
  "descripcion": "Luminaria dañada en esquina derecha",
  "evaluacion": {
    "area_1": 3,
    "area_2": 5,
    "area_4": 2
  },
  "isDraft": false
}
```

**Respuesta:** `201 Created` con el objeto `Reporte` creado.

---

### `GET /api/reportes/[id]`

Retorna un reporte por ID con todas sus relaciones.

**Respuesta:**
```json
{
  "id": 1,
  "nombreSolicitante": "María García",
  "tipoUbicacion": "Aula",
  "estado": "PENDIENTE",
  "areaResponsable": null,
  "observaciones": null,
  "evaluacion": {
    "area_1": 3,
    "area_4": 2
  },
  "espacio": {
    "espacio": "B1-001",
    "grupo": { "nombre": "Bloque A1" },
    "tipoEspacio": { "nombre": "Aula" }
  },
  "creadoPor": { "name": "María García", "email": "jefe.limpieza@faciltrack.local" },
  "personalResponsable": { "nombre": "Técnico Electricidad" }
}
```

---

### `PATCH /api/reportes/[id]`

Actualiza estado, área responsable, observaciones y/o personal asignado.

**Body** (todos opcionales):
```json
{
  "estado": "EN_PROCESO",
  "areaResponsable": "Electricidad",
  "observaciones": "Se revisará el sistema eléctrico",
  "personalResponsableId": 3
}
```

**Comportamiento automático:**
- `estado: EN_PROCESO` → registra `fechaAtencion = now()`
- `estado: ATENDIDO` → registra `fechaResolucion = now()`

---

### `DELETE /api/reportes/[id]`

Elimina un reporte permanentemente.

**Requiere rol:** `ADMIN`

**Respuesta:** `{ "ok": true }`

---

## Áreas de responsabilidad

### `GET /api/areas`

Lista todas las áreas activas ordenadas por nombre.

**Respuesta:**
```json
[
  { "id": 1, "nombre": "Electricidad" },
  { "id": 2, "nombre": "General" },
  { "id": 3, "nombre": "Infraestructura" },
  { "id": 4, "nombre": "Limpieza" },
  { "id": 5, "nombre": "Mantenimiento General" },
  { "id": 6, "nombre": "Plomería" },
  { "id": 7, "nombre": "Tecnología" }
]
```

Usado por `EvaluacionSection` en el formulario (filtra "General") y por `EvaluacionChecklist` en el detalle.

---

## Catálogos de ubicación

### `GET /api/tipos-espacio`

Lista todos los tipos de espacio.

**Respuesta:**
```json
[
  { "id": 1, "nombre": "Aula", "categoriaEvaluacion": "SALONES" },
  { "id": 4, "nombre": "Servicio Sanitario", "categoriaEvaluacion": "SANITARIOS" },
  { "id": 6, "nombre": "Área Común", "categoriaEvaluacion": "AREAS_COMUNES" }
]
```

---

### `GET /api/grupos`

Lista grupos/edificios, opcionalmente filtrados por tipo de espacio.

**Query params:**

| Param | Tipo | Descripción |
|---|---|---|
| `idTipoEspacio` | number | Filtrar grupos que tienen espacios de ese tipo |

**Respuesta:**
```json
[
  { "id": 1, "nombre": "Bloque J" },
  { "id": 2, "nombre": "Bloque A1" }
]
```

---

### `GET /api/espacios`

Lista espacios con filtros en cascada.

**Query params:**

| Param | Tipo | Descripción |
|---|---|---|
| `idGrupo` | number | Filtrar por edificio/grupo |
| `idTipoEspacio` | number | Filtrar por tipo de espacio |

**Respuesta:**
```json
[
  { "id": 15, "espacio": "B1-001", "piso": null },
  { "id": 16, "espacio": "B1-002", "piso": "1er Piso" }
]
```

El formulario usa estos tres endpoints en cascada: el usuario elige tipo → se cargan grupos → se cargan espacios.

---

## Personal

### `GET /api/personal`

Lista el personal técnico, opcionalmente filtrado por área.

**Query params:**

| Param | Tipo | Descripción |
|---|---|---|
| `areaId` | number | Filtrar por área de responsabilidad |

**Respuesta:**
```json
[
  { "id": 1, "nombre": "Juan Pérez", "areaId": 3 },
  { "id": 2, "nombre": "Ana López", "areaId": 3 }
]
```

---

## Autenticación

### `GET /api/auth/[...nextauth]`
### `POST /api/auth/[...nextauth]`

Manejados automáticamente por NextAuth v5. Incluye:
- `GET /api/auth/session` — datos de la sesión actual
- `POST /api/auth/signin/credentials` — inicio de sesión
- `POST /api/auth/signout` — cerrar sesión
- `GET /api/auth/csrf` — token CSRF
