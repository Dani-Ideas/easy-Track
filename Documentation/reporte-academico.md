# UNIVERSIDAD NACIONAL AUTÓNOMA DE MÉXICO
## FACULTAD DE ESTUDIOS SUPERIORES ARAGÓN

**INGENIERÍA EN COMPUTACIÓN — CUARTO SEMESTRE (periodo: 2026-II)**

---

| | |
|---|---|
| **Alumno** | Daniel Alejandro Romero Navarro |
| **Número de cuenta** | 423065534 |
| **Grupo** | 2007 |
| **Trabajo** | Proyecto de vinculación empresarial |
| **Profesor** | Aaron Velasco Agustín |
| **Fecha de entrega** | 26/05/2026 |

---

# FacilTrack — Sistema de Gestión de Reportes de Mantenimiento Institucional

---

## Índice

3. [Resumen Ejecutivo](#3-resumen-ejecutivo)
4. [Introducción](#4-introducción)
5. [Planteamiento del Problema](#5-planteamiento-del-problema)
6. [Objetivos](#6-objetivos)
7. [Marco Teórico](#7-marco-teórico)
8. [Alcance del Sistema](#8-alcance-del-sistema)
9. [Requerimientos del Sistema](#9-requerimientos-del-sistema)
10. [Casos de Uso](#10-casos-de-uso)
11. [Historias de Usuario](#11-historias-de-usuario)
12. [Tecnologías Seleccionadas](#12-tecnologías-seleccionadas)
13. [Arquitectura del Sistema](#13-arquitectura-del-sistema)
14. [Estructura del Proyecto y Distribución](#14-estructura-del-proyecto-y-distribución)
15. [Uso de Contenedores y Despliegue](#15-uso-de-contenedores-y-despliegue)
16. [Modelo de Base de Datos](#16-modelo-de-base-de-datos)
17. [Estrategia de Control de Versiones](#17-estrategia-de-control-de-versiones)
20. [Riesgos del Proyecto](#20-riesgos-del-proyecto)
21. [Conclusiones](#21-conclusiones)

---

## 3. Resumen Ejecutivo

**Problema identificado:** La Facultad de Estudios Superiores Aragón gestiona el mantenimiento de sus instalaciones físicas (aulas, laboratorios, sanitarios y áreas comunes) mediante comunicación informal a través de grupos de WhatsApp. Este método provoca pérdida de información, ausencia de métricas y falta de trazabilidad en la atención de incidencias.

**Solución propuesta:** FacilTrack es un sistema web institucional que digitaliza el ciclo completo de un reporte de mantenimiento: desde su registro por parte de un solicitante hasta su resolución por el personal técnico, pasando por la asignación administrativa y el seguimiento del estado.

**Tecnologías seleccionadas:** Next.js 16 (App Router) con TypeScript, MySQL 8, Prisma 6 como ORM, NextAuth.js v5 para autenticación basada en roles, y Docker Compose para el despliegue.

**Beneficio esperado:** Centralizar la información de mantenimiento en una plataforma accesible, con roles diferenciados (ADMIN, STAFF, TECNICO), historial de auditoría y métricas exportables que permitan a la administración tomar decisiones basadas en datos reales.

**Alcance general:** Sistema web monolítico de un solo inquilino, desplegable con un único comando Docker, que cubre el registro de incidencias, la gestión administrativa y el análisis estratégico mediante un dashboard con exportación a Excel.

---

## 4. Introducción

Las instituciones educativas de nivel superior administran un patrimonio físico extenso: edificios, laboratorios, talleres, servicios sanitarios y áreas comunes que requieren mantenimiento continuo. La FES Aragón no es la excepción: su plantilla incluye múltiples áreas de responsabilidad (electricidad, plomería, limpieza, infraestructura, tecnología, entre otras), cada una con personal dedicado al mantenimiento preventivo y correctivo.

El proceso actual de reporte carece de formalidad. Un docente o administrativo que detecta una falla envía un mensaje a un grupo de WhatsApp, donde el mensaje puede perderse entre conversaciones, no recibir seguimiento y nunca registrarse como resuelto. La consecuencia directa es la imposibilidad de medir tiempos de respuesta, identificar instalaciones con mayor incidencia o demostrar el desempeño del personal de mantenimiento.

La digitalización de este proceso representa un beneficio concreto y medible: toda incidencia queda registrada con fecha, ubicación exacta, área responsable y bitácora de acciones. Cualquier usuario autorizado puede consultar el estado de un reporte en tiempo real, y la administración puede generar reportes de desempeño sin depender de comunicación informal.

FacilTrack surge como respuesta directa a esta necesidad, aplicando principios de ingeniería de software, arquitectura de sistemas y trabajo colaborativo por módulos.

---

## 5. Planteamiento del Problema

### Situación actual

La institución gestiona los reportes de mantenimiento de manera informal, principalmente a través de grupos de WhatsApp. No existe una plataforma centralizada que registre, asigne o dé seguimiento a las incidencias en instalaciones físicas.

### Problemas detectados

- **Pérdida de información:** Los mensajes en grupos de chat no tienen estructura ni persistencia garantizada; una incidencia puede quedar sin atender si el mensaje se pierde en el flujo de conversación.
- **Falta de seguimiento:** No existe un mecanismo que notifique el cambio de estado de un reporte ni que documente las acciones tomadas.
- **Ausencia de métricas:** Es imposible calcular tiempos promedio de atención, identificar edificios con mayor frecuencia de fallas o evaluar el desempeño por área.
- **Falta de control administrativo:** La asignación de personal técnico se realiza de forma verbal o por mensajes privados, sin trazabilidad.
- **Desorganización en la asignación de tareas:** Las áreas de responsabilidad (electricidad, plomería, etc.) no tienen visibilidad exclusiva de los reportes que les corresponden.

### Impacto operativo

La falta de un sistema formal genera retrasos en la atención, duplicidad de reportes de la misma incidencia y dificultad para demostrar el trabajo realizado por el personal de mantenimiento. En casos de auditoría o rendición de cuentas, la institución no cuenta con evidencia documental del proceso.

---

## 6. Objetivos

### Objetivo general

Desarrollar un sistema web funcional que permita la gestión administrativa de reportes de mantenimiento institucional, aplicando principios de organización de equipos, levantamiento de requerimientos, arquitectura de software y trabajo colaborativo.

### Objetivos específicos

1. Implementar un formulario de registro de incidencias con selección de ubicación en tres pasos (tipo de espacio → edificio/bloque → espacio específico) y calificación de áreas de responsabilidad mediante un carrusel interactivo de estrellas.

2. Implementar un sistema de control de acceso basado en roles (ADMIN, STAFF, TECNICO) que garantice que cada usuario solo visualice y opere los reportes correspondientes a su área de responsabilidad.

3. Implementar el ciclo de vida completo de un reporte (PENDIENTE → EN_PROCESO → ATENDIDO) con registro automático de marcas de tiempo y bitácora de auditoría para cada acción administrativa.

4. Desarrollar un panel administrativo con métricas en tiempo real, filtros combinados por estado, tipo de ubicación y rango de fechas, y exportación de datos a formato Excel.

5. Contenerizar el sistema completo con Docker Compose de forma que el despliegue se reduzca a un único comando, con inicialización automática de base de datos y datos de prueba.

6. Aplicar una estrategia de control de versiones por módulo mediante ramas Git independientes, integrando el trabajo de los distintos equipos a través de Pull Requests hacia una rama de desarrollo compartida.

7. Garantizar que el sistema sea mantenible a largo plazo mediante una arquitectura limpia de separación de responsabilidades (Server Components para datos, Client Components para interactividad), validación de entrada en capas y un ORM tipado que elimine SQL manual.

---

## 7. Marco Teórico

### Sistemas de información

Un sistema de información es un conjunto de componentes que recopilan, procesan, almacenan y distribuyen datos para apoyar la toma de decisiones en una organización. FacilTrack es un sistema de información transaccional (TPS, por sus siglas en inglés): registra transacciones operativas (creación y actualización de reportes) y las convierte en información consultable para la gestión administrativa.

### Sistemas administrativos

Los sistemas administrativos digitales reemplazan procesos manuales o informales por flujos de trabajo estructurados. En el contexto de mantenimiento institucional, un sistema administrativo debe garantizar: registro formal de incidencias, asignación de responsabilidades, control de estados y generación de métricas de desempeño.

### Desarrollo web moderno

El desarrollo web contemporáneo separa las responsabilidades entre cliente y servidor. Next.js implementa este modelo mediante Server Components (código que corre en el servidor y accede directamente a la base de datos) y Client Components (código que corre en el navegador y gestiona la interactividad). Esta separación reduce la cantidad de datos enviados al cliente y mejora el tiempo de carga inicial.

### Bases de datos relacionales

MySQL es un sistema gestor de bases de datos relacional (RDBMS) que organiza la información en tablas con esquemas definidos y relaciones entre entidades. El uso de un ORM (Object-Relational Mapper) como Prisma permite interactuar con la base de datos mediante objetos TypeScript tipados, eliminando la escritura manual de SQL y reduciendo errores de tipo en tiempo de compilación.

### Gestión de incidencias

Una incidencia es cualquier evento no planificado que interrumpe o degrada el funcionamiento normal de una instalación. Los sistemas de gestión de incidencias implementan flujos de estados (reportado → en atención → resuelto), asignación de responsables y registro histórico, siguiendo prácticas establecidas en marcos como ITIL (Information Technology Infrastructure Library).

### Git y control de versiones

Git es un sistema de control de versiones distribuido que permite a múltiples desarrolladores trabajar en paralelo sobre el mismo código fuente. El flujo de ramas por módulo (feature branching) asigna una rama independiente a cada equipo o funcionalidad, minimizando los conflictos de integración. Los Pull Requests son mecanismos formales de revisión antes de integrar cambios a la rama principal.

### Docker y contenedores

Un contenedor es una unidad de software que empaqueta el código de una aplicación junto con todas sus dependencias en un entorno aislado y reproducible. Docker permite definir estos entornos mediante un `Dockerfile` y orquestar múltiples contenedores (por ejemplo, aplicación + base de datos) mediante `docker-compose.yml`. La ventaja principal es la eliminación del problema "funciona en mi máquina": cualquier sistema con Docker instalado ejecutará el proyecto de forma idéntica.

---

## 8. Alcance del Sistema

### Lo que el sistema SÍ hace

- Registro de reportes de inspección con selección de ubicación (tipo de espacio, edificio y espacio específico) y calificación de áreas de responsabilidad (1–5 estrellas).
- Control de acceso basado en tres roles: ADMIN (acceso completo), STAFF (jefe de área, crea reportes), TECNICO (ve y atiende reportes de su área).
- Gestión del ciclo de vida de reportes: PENDIENTE → EN_PROCESO → ATENDIDO, con asignación de área responsable, personal técnico y observaciones.
- Panel administrativo con métricas (totales por estado), tabla filtreable y paginada, y exportación a Excel.
- Bitácora de auditoría: cada acción administrativa queda registrada con usuario, fecha, IP y detalle.
- Despliegue completo con Docker Compose: un solo comando levanta base de datos, aplica el schema e inserta datos de prueba.
- Seed automático con usuarios precreados para cada área de responsabilidad (jefe y técnico por área).

### Lo que el sistema NO hace (fuera de alcance)

- Aplicación móvil nativa (el diseño es responsivo pero no hay app para iOS/Android).
- Notificaciones en tiempo real por correo electrónico, SMS o push.
- Adjuntos fotográficos en los reportes.
- Soporte multi-institución (sistema de un solo inquilino).
- Autenticación con cuenta institucional UNAM (SSO/OAuth — pendiente de aprobación).
- Mantenimiento preventivo programado (solo correctivo/reactivo).
- Integración con sistemas externos de inventario o nómina.

---

## 9. Requerimientos del Sistema

### Requerimientos Funcionales

| ID | Requerimiento |
|---|---|
| RF-01 | El sistema deberá permitir al usuario seleccionar la ubicación del reporte en tres pasos: tipo de espacio, edificio/bloque y espacio específico. |
| RF-02 | El sistema deberá mostrar un carrusel de calificación (1–5 estrellas) por cada área de responsabilidad activa, avanzando automáticamente al seleccionar una calificación. |
| RF-03 | El sistema no deberá permitir avanzar al siguiente área en el carrusel si el área actual no ha sido calificada. |
| RF-04 | El sistema deberá registrar el reporte en la base de datos al enviar el formulario y redirigir al usuario a la vista de detalle. |
| RF-05 | El sistema deberá mostrar en el panel principal el conteo de reportes por estado (PENDIENTE, EN_PROCESO, ATENDIDO). |
| RF-06 | El sistema deberá permitir filtrar los reportes por estado, tipo de ubicación y rango de fechas de forma combinada. |
| RF-07 | El sistema deberá permitir al ADMIN asignar un área responsable, un técnico y observaciones a un reporte. |
| RF-08 | El sistema deberá cambiar el estado del reporte a EN_PROCESO al realizar la primera asignación, y a ATENDIDO al marcar resolución. |
| RF-09 | El sistema deberá registrar automáticamente la fecha de inicio de atención y la fecha de resolución al cambiar de estado. |
| RF-10 | El sistema deberá mostrar solo los reportes del área de responsabilidad propia a los usuarios con rol TECNICO o STAFF. |
| RF-11 | El sistema deberá registrar en la bitácora cada cambio de estado, asignación o modificación, incluyendo usuario, fecha y detalle. |
| RF-12 | El sistema deberá mostrar la bitácora de auditoría completa de un reporte únicamente al usuario con rol ADMIN. |
| RF-13 | El sistema deberá mostrar el detalle completo del reporte, incluyendo: nombre del reportero, fecha, ubicación exacta y calificaciones por área de responsabilidad. |
| RF-14 | El sistema deberá permitir la consulta de las notas y comentarios técnicos registrados durante el proceso de atención. |
| RF-15 | El sistema deberá mostrar el identificador único (ID) del reporte para facilitar el mantenimiento técnico del software. |
| RF-16 | El sistema deberá permitir exportar los reportes filtrados actuales a un archivo Excel (.xlsx). |

### Requerimientos No Funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | El sistema deberá desplegarse con un único comando (`docker compose up --build`) sin configuración adicional. |
| RNF-02 | El sistema deberá soportar tema claro y oscuro, persitido entre sesiones. |
| RNF-03 | Las contraseñas deberán almacenarse como hashes bcrypt; nunca en texto plano. |
| RNF-04 | El sistema deberá validar todos los datos de entrada en el servidor, independientemente de la validación en el cliente. |
| RNF-05 | El código deberá estar tipado con TypeScript estricto; los errores de tipo deberán detectarse en tiempo de compilación. |
| RNF-06 | La sesión deberá implementarse con JWT; el token deberá contener el rol y el área del usuario para no requerir consultas adicionales en el middleware. |
| RNF-07 | El sistema deberá funcionar correctamente en navegadores modernos (Chrome, Firefox, Edge, Safari). |

### Reglas de Negocio

| ID | Regla |
|---|---|
| RN-01 | Un reporte solo puede avanzar en la secuencia PENDIENTE → EN_PROCESO → ATENDIDO; no puede retroceder de estado. |
| RN-02 | Solo el ADMIN puede asignar área responsable y cambiar el estado de un reporte. |
| RN-03 | Un usuario TECNICO solo puede ver los reportes cuyo `areaResponsable` coincida con su área. |
| RN-04 | Un usuario STAFF puede crear reportes y consultar el panel, pero no puede gestionar ni cambiar estados. |
| RN-05 | El área "General" solo ve reportes PENDIENTE sin área asignada. |
| RN-06 | El seed es idempotente: si ya existen usuarios en la base de datos, no se insertan datos duplicados. |

---

## 10. Casos de Uso

### Diagrama general de actores

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│    STAFF     │     │    ADMIN     │     │    TECNICO      │
│  (Jefe área) │     │(Administrador│     │(Técnico de área)│
└──────┬──────┘     └──────┬───────┘     └────────┬────────┘
       │                   │                       │
       ├── CU-01 Iniciar sesión ───────────────────┤
       ├── CU-02 Crear reporte                     │
       │                   ├── CU-03 Ver dashboard  │
       │                   ├── CU-04 Asignar tarea   │
       │                   ├── CU-05 Cambiar estado  │
       │                   ├── CU-06 Ver bitácora    │
       │                   └── CU-07 Eliminar reporte│
       │                                            ├── CU-08 Ver reportes del área
       └───────────────────────────────────────────── CU-09 Consultar detalle
```

---

**CU-01: Iniciar sesión**
- **Actor:** Cualquier usuario
- **Precondición:** El usuario tiene credenciales válidas en el sistema.
- **Flujo principal:**
  1. El usuario accede a `/login`.
  2. Ingresa correo electrónico y contraseña.
  3. El sistema valida las credenciales contra la base de datos (bcrypt).
  4. Si son válidas, crea un JWT con `{ id, email, rol, areaId }` y establece la cookie de sesión.
  5. Redirige a `/dashboard`.
- **Postcondición:** El usuario tiene una sesión activa y puede acceder a las rutas protegidas.

---

**CU-02: Crear reporte de inspección**
- **Actor:** STAFF
- **Precondición:** El usuario tiene sesión activa.
- **Flujo principal:**
  1. El usuario navega a `/reportes/nuevo`.
  2. Ingresa su nombre y la fecha de inspección.
  3. Selecciona el tipo de espacio, luego el edificio/bloque, luego el espacio específico.
  4. Califica cada área de responsabilidad con 1–5 estrellas en un carrusel.
  5. Opcionalmente añade comentarios.
  6. Envía el formulario.
  7. El sistema crea el reporte con estado PENDIENTE y redirige a `/reportes/[id]`.
- **Postcondición:** El reporte queda registrado con todos sus datos y está visible en el dashboard.

---

**CU-03: Consultar panel administrativo**
- **Actor:** ADMIN
- **Precondición:** El usuario tiene rol ADMIN y sesión activa.
- **Flujo principal:**
  1. El usuario accede a `/dashboard`.
  2. El sistema muestra el conteo de reportes por estado.
  3. El usuario aplica filtros (estado, tipo, fechas).
  4. La tabla se actualiza reactivamente con los reportes que coinciden.
  5. El usuario puede exportar los resultados a Excel.
- **Postcondición:** El usuario obtiene una vista filtrada de todos los reportes del sistema.

---

**CU-04: Asignar tarea y registrar atención**
- **Actor:** ADMIN
- **Precondición:** El reporte existe y está en estado PENDIENTE.
- **Flujo principal:**
  1. El ADMIN abre el detalle del reporte.
  2. Hace clic en "Asignar tarea".
  3. Selecciona el área responsable y el personal técnico.
  4. Escribe las observaciones técnicas.
  5. Confirma la asignación.
  6. El sistema cambia el estado a EN_PROCESO, registra `fechaAtencion` y crea un registro en la bitácora.
- **Postcondición:** El reporte tiene área y técnico asignados; su estado es EN_PROCESO.

---

**CU-05: Cambiar estado a ATENDIDO**
- **Actor:** ADMIN
- **Precondición:** El reporte está en estado EN_PROCESO.
- **Flujo principal:**
  1. El ADMIN abre el detalle del reporte.
  2. Hace clic en "Marcar como resuelto".
  3. El sistema registra `fechaResolucion`, cambia el estado a ATENDIDO y añade entrada a la bitácora.
- **Postcondición:** El reporte queda cerrado con fecha de resolución registrada.

---

**CU-06: Consultar detalles técnicos del reporte**
- **Actor:** TECNICO / ADMIN
- **Precondición:** El usuario tiene permisos de lectura en el módulo de reportes.
- **Flujo principal:**
  1. El usuario abre el detalle del reporte.
  2. El sistema muestra nombre del solicitante, fecha, ubicación exacta, calificaciones por área y comentarios.
  3. El usuario consulta el ID del reporte para referencia técnica.
- **Postcondición:** El personal cuenta con la información completa para planificar la intervención.

---

**CU-07: Eliminar reporte**
- **Actor:** ADMIN
- **Precondición:** El usuario tiene rol ADMIN.
- **Flujo principal:**
  1. El ADMIN accede al detalle del reporte.
  2. Selecciona la opción de eliminar y confirma.
  3. El sistema envía `DELETE /api/reportes/[id]`, verifica el rol y elimina el registro.
- **Postcondición:** El reporte ya no existe en el sistema.

---

**CU-08: Ver reportes asignados al área**
- **Actor:** TECNICO
- **Precondición:** El usuario tiene rol TECNICO y área asignada.
- **Flujo principal:**
  1. El TECNICO accede al dashboard.
  2. El sistema filtra automáticamente los reportes por `areaResponsable` igual al área del usuario.
  3. El TECNICO solo ve los reportes de su área.
- **Postcondición:** El técnico visualiza únicamente los reportes de su responsabilidad.

---

## 11. Historias de Usuario

| ID | Historia |
|---|---|
| HU-01 | Como STAFF, quiero seleccionar la ubicación exacta de la incidencia (tipo → edificio → espacio) para que el técnico sepa dónde ir sin necesidad de comunicación adicional. |
| HU-02 | Como STAFF, quiero calificar el estado de cada área de responsabilidad con estrellas para dar una evaluación rápida del estado general de la instalación. |
| HU-03 | Como ADMIN, quiero ver en el dashboard un conteo actualizado de reportes por estado para tener visibilidad inmediata de la carga de trabajo pendiente. |
| HU-04 | Como ADMIN, quiero asignar un técnico y un área responsable a cada reporte para que el personal sepa qué le corresponde atender. |
| HU-05 | Como ADMIN, quiero marcar un reporte como resuelto y que el sistema registre automáticamente la fecha de resolución para tener métricas de tiempo de respuesta. |
| HU-06 | Como ADMIN, quiero exportar los reportes filtrados a Excel para compartirlos con dirección sin necesidad de capturas de pantalla. |
| HU-07 | Como TECNICO, quiero ver únicamente los reportes de mi área para no distraerme con incidencias que no me corresponden. |
| HU-08 | Como ADMIN, quiero ver la bitácora completa de cada reporte para auditar quién hizo qué y cuándo. |
| HU-09 | Como cualquier usuario, quiero iniciar sesión con mi correo y contraseña para acceder a las funciones según mi rol. |
| HU-10 | Como usuario del sistema, quiero que la aplicación funcione en modo oscuro para reducir la fatiga visual en entornos de trabajo con poca luz. |
| HU-11 | Como TECNICO, quiero ver la lista de evaluación y los comentarios del reportero para identificar qué componentes requieren atención prioritaria sin necesidad de inspección previa. |
| HU-12 | Como ADMIN, quiero ver el ID único del reporte en la interfaz para identificar rápidamente el registro en la base de datos en caso de requerir una corrección manual. |

---

## 12. Tecnologías Seleccionadas

### Stack tecnológico

| Capa | Tecnología | Versión | Justificación |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.2.1 | SSR nativo, rutas de API integradas, separación Server/Client Components. Elimina la necesidad de un backend independiente. |
| Lenguaje | TypeScript | 5.x | Tipado estático que detecta errores en compilación; mejora la mantenibilidad en equipos. |
| Base de datos | MySQL 8 (Docker) | 8.x | RDBMS maduro, amplio soporte, fácil de contenerizar. Relaciones claras entre entidades del dominio. |
| ORM | Prisma | 6.x | Genera tipos TypeScript desde el schema; elimina SQL manual y reduce errores de tipo en consultas. |
| Autenticación | NextAuth.js v5 beta | 5.0.0-beta.30 | Integración nativa con Next.js App Router; soporta Edge Runtime en middleware; estrategia JWT configurable. |
| Estado global | Zustand (con persist) | 5.x | API mínima, sin boilerplate; persistencia de filtros del dashboard entre navegaciones. |
| Formularios | react-hook-form + Zod | 7.x / 4.x | Validación declarativa y tipada; integración directa entre el resolver Zod y los esquemas del ORM. |
| UI Components | shadcn/ui (new-york) | — | Componentes accesibles basados en Radix UI; instalados en el proyecto (no como dependencia externa), permitiendo personalización total. |
| Styling | Tailwind CSS v4 | 4.x | Utilidades CSS en línea; sin archivos CSS separados; diseño consistente con variables de tema. |
| Iconos | Lucide React | 1.x | Librería SVG tree-shakeable; íconos semánticos para el dominio del sistema. |
| Tema | next-themes | 0.4.x | Alternancia claro/oscuro con persistencia en `localStorage`; estrategia `class` compatible con Tailwind. |
| Exportación | xlsx (SheetJS) | 0.18.x | Generación de archivos `.xlsx` en el cliente sin dependencias del servidor. |
| Contenedores | Docker Compose | — | Orquestación de MySQL + Next.js en un entorno reproducible con un único comando. |

---

## 13. Arquitectura del Sistema

### Modelo cliente-servidor con separación de capas

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTE (navegador)               │
│  React Client Components: formularios, filtros,      │
│  modales, carruseles — estado local con useState     │
│  Estado global: Zustand (filtros del dashboard)      │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP (fetch / form action)
┌───────────────────────▼─────────────────────────────┐
│               SERVIDOR (Node.js — next start)        │
│                                                      │
│  ┌─────────────────┐   ┌──────────────────────────┐ │
│  │ Server Components│   │    API Routes            │ │
│  │ (páginas del    │   │ /api/reportes             │ │
│  │  dashboard)     │   │ /api/areas                │ │
│  │ Prisma directo  │   │ /api/personal             │ │
│  └────────┬────────┘   └───────────┬──────────────┘ │
│           │  middleware.ts         │                 │
│           │  (Edge Runtime — JWT)  │                 │
└───────────┼────────────────────────┼─────────────────┘
            │                        │
┌───────────▼────────────────────────▼─────────────────┐
│                   MySQL 8 (Docker)                    │
│  Prisma ORM — conexión pool — db:3306 (interno)      │
└───────────────────────────────────────────────────────┘
```

### Módulos del sistema

**Módulo 1 — Registro de Incidencias**
Formulario de inspección en `/reportes/nuevo`. El componente `LocationPicker` guía al usuario en tres pasos: tipo de espacio → edificio/bloque → espacio específico. El componente `EvaluacionSection` presenta un carrusel de calificación por área de responsabilidad (1–5 estrellas), con avance automático tras la selección. La validación usa Zod en cliente y servidor.

**Módulo 2 — Gestión Administrativa y Seguimiento**
Vista de detalle en `/reportes/[id]`. El componente `EstadoSidebar` muestra el estado actual y los botones de avance (solo para ADMIN). El modal `AsignarTareaModal` recoge área responsable, técnico y observaciones. Cada acción genera un registro en `LogAccion` (bitácora).

**Módulo 3 — Análisis y Gestión Estratégica**
Panel principal en `/dashboard`. `StatsGrid` muestra conteos por estado. `DashboardClient` es un Client Component que observa los filtros de Zustand y recarga la tabla reactivamente sin navegar. `ExportButton` exporta los resultados filtrados actuales a `.xlsx`.

### Flujo de peticiones: rutas de API

```
Navegador → localhost:3000/api/reportes
  │
  ├── Docker port mapping 3000:3000
  ├── Node.js (next start) recibe la petición
  ├── middleware.ts: SKIP (las rutas /api/* están excluidas del matcher)
  ├── src/app/api/reportes/route.ts → función GET()
  │     ├── auth() → verifica JWT en cookie (sin consulta a BD)
  │     ├── prisma.user.findUnique() → MySQL db:3306
  │     ├── construir filtros (JavaScript puro)
  │     ├── Promise.all([findMany(), count()]) → dos consultas en paralelo
  │     └── NextResponse.json({ data, total, page, pageSize })
  └── Navegador recibe JSON → React re-renderiza la tabla
```

### Flujo de peticiones: rutas de página

```
Navegador → localhost:3000/dashboard
  │
  ├── middleware.ts → auth.config.ts → authorized()
  │     ├── Sin sesión: redirect /login  (Edge Runtime, sin Node.js)
  │     └── Con sesión: continúa
  ├── src/app/layout.tsx → ThemeProvider, fuentes
  ├── src/app/(dashboard)/layout.tsx → segunda verificación auth(), Sidebar, Header
  └── src/app/(dashboard)/dashboard/page.tsx → Server Component con Prisma directo
```

---

## 14. Estructura del Proyecto y Distribución

### Organización de carpetas

```
faciltrack/
├── prisma/
│   ├── schema.prisma          # Schema de la base de datos
│   └── seed.ts                # Datos de prueba: tipos, grupos, espacios y usuarios
│
├── src/
│   ├── app/
│   │   ├── (auth)/login/      # Página de inicio de sesión (sin sidebar)
│   │   ├── (dashboard)/       # Rutas protegidas con AppShell
│   │   │   ├── layout.tsx     # Sidebar + Header (verifica sesión)
│   │   │   ├── dashboard/     # Panel principal — Módulo 3
│   │   │   ├── reportes/
│   │   │   │   ├── nuevo/     # Formulario de inspección — Módulo 1
│   │   │   │   └── [id]/      # Detalle del reporte — Módulo 2
│   │   │   ├── edificios/     # Gestión de grupos y espacios
│   │   │   ├── personal/      # Gestión de personal técnico
│   │   │   └── analiticas/    # Gráficas y estadísticas
│   │   └── api/               # API Routes (endpoints HTTP)
│   │       ├── reportes/
│   │       ├── areas/
│   │       ├── espacios/
│   │       ├── grupos/
│   │       ├── tipos-espacio/
│   │       └── personal/
│   │
│   ├── components/
│   │   ├── ui/                # Primitivos shadcn/ui (Button, Dialog, etc.)
│   │   ├── layout/            # Sidebar, Header, Breadcrumb, ThemeToggle
│   │   ├── dashboard/         # StatsGrid, ReportsTable, filtros, paginación
│   │   ├── reportes/          # Formulario de inspección y secciones
│   │   └── detalle/           # Vista de detalle del reporte
│   │
│   ├── lib/
│   │   ├── auth.ts            # Configuración NextAuth (Node.js)
│   │   ├── prisma.ts          # Singleton del cliente Prisma
│   │   └── validations/       # Schemas Zod
│   │
│   └── store/                 # Stores Zustand
│
├── auth.config.ts             # Config NextAuth edge-safe
├── middleware.ts              # Protección de rutas
├── Dockerfile                 # Imagen de producción
├── docker-compose.yml         # MySQL + app Next.js
└── entrypoint.sh              # Script de inicio: db push → seed → next start
```

### Distribución por equipos

| Módulo | Rama Git | Responsabilidad |
|---|---|---|
| Módulo 1 — Registro | `registro` | Formulario de inspección, LocationPicker, EvaluacionSection |
| Módulo 2 — Seguimiento | `seguimiento` | AsignarTareaModal, cambio de estado, BitacoraPanel |
| Módulo 3 — Panel | `panel` | Dashboard, StatsGrid, filtros, exportación, Edificios, Personal |
| Base de datos | `DB` | Schema Prisma, seed, APIs de áreas y personal |

---

## 15. Uso de Contenedores y Despliegue

### Inicio Rápido

Un único comando levanta todo el sistema:

```bash
docker compose up --build
```

Abre **http://localhost:3000**. Docker se encarga de todo automáticamente: descarga las imágenes necesarias, levanta MySQL, espera a que esté listo, crea las tablas e inserta los datos de prueba.

Para resetear completamente la base de datos:

```bash
docker compose down -v && docker compose up
```

> **Requisito único:** tener Docker instalado. No se necesita Node.js local.

### Credenciales de prueba (contraseña `123456` para todos)

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

### Arquitectura Docker

```
docker-compose.yml
├── db (mysql:8)
│   ├── Puerto host: 3307 → contenedor: 3306
│   ├── Volumen persistente: mysqldata
│   └── Healthcheck: mysqladmin ping cada 5s (12 reintentos)
│
└── app (imagen construida desde Dockerfile)
    ├── Puerto host: 3000 → contenedor: 3000
    ├── depends_on: db (espera healthcheck)
    └── entrypoint.sh:
          1. nc -z db 3306 (espera TCP)
          2. prisma db push (crea/actualiza tablas)
          3. npm run db:seed (seed idempotente)
          4. next start (servidor de producción)
```

### Dockerfile — fases de construcción

```dockerfile
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl netcat-openbsd

# 1. Instalar dependencias (capa cacheada — solo se repite si cambia package.json)
COPY package*.json ./
RUN npm ci

# 2. Copiar código fuente
COPY . .

# 3. Generar cliente Prisma (no conecta a BD, solo lee el schema)
ARG DATABASE_URL=mysql://build:build@localhost:3306/build
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate

# 4. Compilar Next.js
RUN npm run build

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
```

**Optimización de capas:** `package*.json` se copia antes que el código fuente. Docker cachea la capa de `npm ci` y solo la repite cuando cambian las dependencias, no al modificar archivos `.tsx`.

### Comunicación entre servicios

El contenedor `app` se conecta a MySQL usando el nombre de servicio `db` como hostname:
`DATABASE_URL=mysql://faciltrack:faciltrack@db:3306/faciltrack`

Docker resuelve `db` → IP interna del contenedor MySQL mediante su servidor DNS embebido. El puerto `3307` solo existe en el host (para Prisma Studio o clientes MySQL externos) y no es usado por la comunicación interna entre contenedores.

---

## 16. Modelo de Base de Datos

**Motor:** MySQL 8 vía Docker Compose.

### Diagrama de relaciones

```
TipoEspacio         Grupo
    │                 │
    └────┐     ┌──────┘
         ▼     ▼
        Espacio ─────────────────────── Reporte ◄─── User
                                            │            │
                                       LogAccion       Area
                                            │            │
                                       Personal ────────┘
User ──── Area
 │
 ├── Account   (NextAuth)
 └── Session   (NextAuth)
```

### Modelos

**User**

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | String (cuid) | PK |
| `email` | String (unique) | Correo electrónico |
| `password` | String? | Hash bcrypt |
| `role` | Role | STAFF, ADMIN o TECNICO |
| `areaId` | Int? | FK → Area |

**Area** — 7 áreas en el seed: General, Mantenimiento General, Electricidad, Plomería, Limpieza, Infraestructura, Tecnología.

**TipoEspacio** — 6 tipos: Aula, Laboratorio, Taller, Servicio Sanitario, Área Administrativa, Área Común.

**Grupo** — 27 edificios y bloques en el seed.

**Espacio** — 436 espacios físicos.

**Reporte** (modelo central)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Int | PK |
| `estado` | EstadoReporte | PENDIENTE, EN_PROCESO, ATENDIDO |
| `evaluacion` | Json? | `{ "area_1": 4, "area_3": 5 }` |
| `areaResponsable` | String? | Área asignada |
| `fechaAtencion` | DateTime? | Registro automático al pasar a EN_PROCESO |
| `fechaResolucion` | DateTime? | Registro automático al pasar a ATENDIDO |

**Estructura del campo `evaluacion`:**
```json
{
  "area_1": 4,
  "area_3": 5,
  "area_4": 2
}
```
Las claves son `area_{id}` (id del modelo Area). Solo se almacenan las áreas calificadas (valor > 0). Este diseño permite agregar o modificar áreas sin alterar el schema de la base de datos.

**Transiciones de estado:**
```
PENDIENTE ──► EN_PROCESO ──► ATENDIDO
```

**LogAccion** — bitácora de auditoría con usuario, acción, detalle, IP y timestamp automático.

---

## 17. Estrategia de Control de Versiones

### Modelo de ramas

```
main          ← rama estable (producción)
  └── Develop ← rama de integración
        ├── DB          ← schema Prisma, seed, migraciones de BD
        ├── registro    ← Módulo 1: formulario de inspección
        ├── panel       ← Módulo 3: dashboard y analíticas
        └── seguimiento ← Módulo 2: gestión administrativa y bitácora
```

### Flujo de trabajo

Cada equipo trabajó en su rama y abrió un Pull Request hacia `Develop`. Los merges documentados en el historial:

```
merge(Develop): integrar seguimiento — asignación manual y bitácora de reportes
merge(Develop): integrar panel — dashboard final, Personal, Edificios y Analíticas
merge(Develop): integrar módulo de registro — formulario con LocationPicker
merge(Develop): integrar sprint de BD — schema, roles, APIs de personal y middleware de áreas
```

### Convención de commits

Los mensajes siguen el formato `tipo(scope): descripción`:

| Tipo | Uso |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de error |
| `docs` | Cambios en documentación |
| `refactor` | Cambio de código sin nueva funcionalidad ni corrección |
| `chore` | Tareas de mantenimiento (dependencias, configuración) |

**Ejemplos del proyecto:**
```
feat(evaluacion): carrusel con auto-avance y navegación bloqueada sin calificación
fix(docker): pasar DATABASE_URL dummy en build para prisma generate
fix(ts): evitar narrowing a never en LocationPicker
docs: reescribir documentación completa del estado actual del proyecto
```

### Repositorio remoto

El proyecto tiene un remote `unam` con las ramas de cada módulo disponibles para revisión del profesor.

---

## 20. Riesgos del Proyecto

### Riesgos técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Conflictos de integración al hacer merge entre ramas de módulos | Media | Alto | Reuniones de coordinación antes de cada merge; PR con revisión cruzada |
| Pérdida de datos en la base de datos de desarrollo | Baja | Alto | Volumen Docker persistente; seed idempotente para reconstruir datos rápidamente |
| Incompatibilidad de versiones de dependencias | Media | Medio | `package-lock.json` fija versiones exactas; `npm ci` en lugar de `npm install` |
| Errores de tipo en TypeScript no detectados antes de producción | Baja | Medio | TypeScript estricto con verificación en `npm run build`; CI en rama principal |
| Puertos ocupados en el host al usar Docker | Media | Bajo | Variables de entorno para configurar puertos; documentación clara de requisitos |

### Riesgos organizacionales

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Diferencias de criterio entre equipos sobre el diseño de la API | Media | Medio | Definición del schema de BD en rama `DB` como contrato compartido entre módulos |
| Alcance no claramente definido entre módulos (funcionalidades solapadas) | Media | Alto | Descripción explícita de responsabilidades por módulo y casos de uso documentados |
| Adopción del sistema por parte del personal institucional | Baja | Alto | Seed con credenciales precreadas; interfaz intuitiva; inicio rápido con Docker |

---

## 21. Conclusiones

FacilTrack cumple los objetivos planteados al inicio del proyecto. El sistema digitaliza el ciclo completo de un reporte de mantenimiento institucional, desde el registro por parte del solicitante hasta su resolución y registro histórico, reemplazando la comunicación informal por un flujo estructurado con roles, estados y trazabilidad.

Las decisiones de arquitectura tomadas — separación Server/Client Components de Next.js, estrategia JWT con Edge Runtime, evaluación como JSON dinámico, seed idempotente y contenerización con Docker — resultaron adecuadas para el alcance del proyecto. En particular, el diseño del campo `evaluacion` como JSON con claves `area_{id}` demostró ser flexible: permite agregar o modificar áreas de responsabilidad sin requerir migraciones de schema.

El trabajo en ramas independientes por módulo (registro, panel, seguimiento, DB) permitió que los tres equipos avanzaran en paralelo con mínima fricción de integración. La rama `DB` como contrato compartido (schema y seed) evitó inconsistencias entre los módulos al definir las entidades del dominio antes del desarrollo de cada módulo.

Como trabajo futuro, el sistema puede extenderse con notificaciones por correo electrónico al cambiar el estado de un reporte, adjuntos fotográficos para documentar las incidencias, autenticación con cuenta institucional UNAM mediante OAuth (ya contemplada en la arquitectura, pendiente de aprobación), y despliegue en un servidor real aprovechando la imagen Docker generada, compatible con Kubernetes si la escala lo requiere.
