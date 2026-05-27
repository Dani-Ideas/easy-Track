import "dotenv/config";
import { PrismaClient, CategoriaEvaluacion } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function rooms(prefix: string, count: number): { espacio: string }[] {
  return Array.from({ length: count }, (_, i) => ({
    espacio: `${prefix}${String(i + 1).padStart(3, "0")}`,
  }));
}

function labAreas(
  config: Array<[start: number, end: number, piso: string]>
): { espacio: string; piso: string }[] {
  return config.flatMap(([start, end, piso]) =>
    Array.from({ length: end - start + 1 }, (_, i) => ({
      espacio: `Área técnica ${String(start + i).padStart(2, "0")}`,
      piso,
    }))
  );
}

type EspacioDef = { espacio: string; piso?: string; idGrupo: number; idTipoEspacio: number };

function forGrupo(
  idGrupo: number,
  idTipoEspacio: number,
  items: { espacio: string; piso?: string }[]
): EspacioDef[] {
  return items.map(({ espacio, piso }) => ({ espacio, piso, idGrupo, idTipoEspacio }));
}

/** Convierte nombre de área a slug para el correo: "Plomería" → "plomeria" */
function toSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, ".");
}

const DEFAULT_AREAS = [
  "General",
  "Mantenimiento General",
  "Electricidad",
  "Plomería",
  "Limpieza",
  "Infraestructura",
  "Tecnología",
];

async function main() {
  // ── Idempotencia: si ya hay usuarios, la DB ya fue inicializada ──────────────
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log("✅ Base de datos ya inicializada — seed omitido");
    return;
  }

  // Full reset — FK-safe deletion order
  await prisma.logAccion.deleteMany();
  await prisma.reporte.deleteMany();
  await prisma.personal.deleteMany();
  await prisma.user.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.area.deleteMany();
  await prisma.espacio.deleteMany();
  await prisma.grupo.deleteMany();
  await prisma.tipoEspacio.deleteMany();

  // ── Áreas responsables ──────────────────────────────────────────────────────
  await prisma.area.createMany({
    data: DEFAULT_AREAS.map((nombre) => ({ nombre })),
  });
  const generalArea = await prisma.area.findUniqueOrThrow({ where: { nombre: "General" } });

  // ── Tipos de espacio ────────────────────────────────────────────────────────
  await prisma.tipoEspacio.createMany({
    data: [
      { id: 1, nombre: "Aula",               categoriaEvaluacion: CategoriaEvaluacion.SALONES       },
      { id: 2, nombre: "Laboratorio",         categoriaEvaluacion: CategoriaEvaluacion.SALONES       },
      { id: 3, nombre: "Taller",              categoriaEvaluacion: CategoriaEvaluacion.SALONES       },
      { id: 4, nombre: "Servicio Sanitario",  categoriaEvaluacion: CategoriaEvaluacion.SANITARIOS    },
      { id: 5, nombre: "Área Administrativa", categoriaEvaluacion: CategoriaEvaluacion.SALONES       },
      { id: 6, nombre: "Área Común",          categoriaEvaluacion: CategoriaEvaluacion.AREAS_COMUNES },
    ],
  });

  // ── Grupos (27) ─────────────────────────────────────────────────────────────
  await prisma.grupo.createMany({
    data: [
      { id:  1, nombre: "Bloque J"                },
      { id:  2, nombre: "Bloque A1"               },
      { id:  3, nombre: "Bloque A2"               },
      { id:  4, nombre: "Bloque A3"               },
      { id:  5, nombre: "Bloque A4"               },
      { id:  6, nombre: "Bloque A5"               },
      { id:  7, nombre: "Bloque A6"               },
      { id:  8, nombre: "Bloque A7"               },
      { id:  9, nombre: "Bloque A8"               },
      { id: 10, nombre: "Bloque A9"               },
      { id: 11, nombre: "Bloque A10"              },
      { id: 12, nombre: "Bloque A11"              },
      { id: 13, nombre: "Bloque PG"               },
      { id: 14, nombre: "Centro Tecnológico"      },
      { id: 15, nombre: "Laboratorios Generales"  },
      { id: 16, nombre: "Laboratorio 1"           },
      { id: 17, nombre: "Laboratorio 2"           },
      { id: 18, nombre: "Laboratorio 3"           },
      { id: 19, nombre: "Laboratorio 4"           },
      { id: 20, nombre: "Área de Medios"          },
      { id: 21, nombre: "Servicios Sanitarios"    },
      { id: 22, nombre: "Edificio Administrativo" },
      { id: 23, nombre: "Centro Documental"       },
      { id: 24, nombre: "Edificio Académico"      },
      { id: 25, nombre: "Edificio Formación"      },
      { id: 26, nombre: "Centro Integral"         },
      { id: 27, nombre: "Zonas Comunes"           },
    ],
  });

  // ── Espacios ─────────────────────────────────────────────────────────────────
  const espacios: EspacioDef[] = [
    ...forGrupo( 1, 1, rooms("J-",    7)),
    ...forGrupo( 2, 1, rooms("B1-",  15)),
    ...forGrupo( 3, 1, rooms("B2-",  15)),
    ...forGrupo( 4, 1, rooms("B3-",  19)),
    ...forGrupo( 5, 1, rooms("B4-",  12)),
    ...forGrupo( 6, 1, rooms("B5-",  19)),
    ...forGrupo( 7, 1, rooms("B6-",  21)),
    ...forGrupo( 8, 1, rooms("B7-",  18)),
    ...forGrupo( 9, 1, rooms("B8-",  27)),
    ...forGrupo(10, 1, rooms("B9-",  16)),
    ...forGrupo(11, 1, rooms("B10-", 23)),
    ...forGrupo(12, 1, rooms("B11-", 34)),
    ...forGrupo(13, 1, rooms("PG-",  25)),
    ...forGrupo(14, 1, [
      { espacio: "Aula 1" }, { espacio: "Aula 2" }, { espacio: "Aula 3" },
      { espacio: "Aula 4" }, { espacio: "Aula 5" }, { espacio: "Aula 6" },
      { espacio: "Aula 7" }, { espacio: "Aula 8" }, { espacio: "Aula 9" },
    ]),
    ...forGrupo(15, 2, [
      { espacio: "Lab. Experimental 1" }, { espacio: "Lab. Experimental 2" },
      { espacio: "Lab. Experimental 3" }, { espacio: "Lab. Experimental 4" },
    ]),
    ...forGrupo(16, 2, labAreas([[1, 10, "Planta Baja"], [11, 12, "1er Piso"]])),
    ...forGrupo(17, 2, labAreas([[1,  8, "Planta Baja"]])),
    ...forGrupo(18, 2, labAreas([[1, 10, "Planta Baja"], [11, 20, "1er Piso"], [21, 33, "2do Piso"]])),
    ...forGrupo(19, 2, labAreas([[1, 10, "Planta Baja"], [11, 14, "1er Piso"]])),
    ...forGrupo(20, 3, [
      { espacio: "Taller Audiovisual" },
      { espacio: "Taller Editorial"   },
      { espacio: "Taller Multimedia"  },
    ]),
    ...forGrupo(21, 4, [
      { espacio: "Bloque Norte planta baja",          piso: "Planta Baja" },
      { espacio: "Bloque Norte 1er piso",             piso: "1er Piso"    },
      { espacio: "Bloque Norte 2do piso",             piso: "2do Piso"    },
      { espacio: "Bloque Sur planta baja",            piso: "Planta Baja" },
      { espacio: "Bloque Sur 1er piso",               piso: "1er Piso"    },
      { espacio: "Bloque Sur 2do piso",               piso: "2do Piso"    },
      { espacio: "Bloque Este planta baja",           piso: "Planta Baja" },
      { espacio: "Bloque Este 1er piso",              piso: "1er Piso"    },
      { espacio: "Bloque Este 2do piso",              piso: "2do Piso"    },
      { espacio: "Bloque Oeste planta baja",          piso: "Planta Baja" },
      { espacio: "Bloque Oeste 1er piso",             piso: "1er Piso"    },
      { espacio: "Bloque Oeste 2do piso",             piso: "2do Piso"    },
      { espacio: "Zona Académica planta baja",        piso: "Planta Baja" },
      { espacio: "Zona Académica 1er piso",           piso: "1er Piso"    },
      { espacio: "Zona Académica 2do piso",           piso: "2do Piso"    },
      { espacio: "Zona Administrativa planta baja",   piso: "Planta Baja" },
      { espacio: "Zona Administrativa 1er piso",      piso: "1er Piso"    },
      { espacio: "Zona Administrativa 2do piso",      piso: "2do Piso"    },
      { espacio: "Centro Documental"                                      },
      { espacio: "Centro Tecnológico 1er piso",       piso: "1er Piso"    },
      { espacio: "Centro Tecnológico 2do piso",       piso: "2do Piso"    },
      { espacio: "Centro de Idiomas 2do piso",        piso: "2do Piso"    },
      { espacio: "Edificio Multiusos planta baja",    piso: "Planta Baja" },
      { espacio: "Edificio Multiusos 1er piso",       piso: "1er Piso"    },
      { espacio: "Edificio Multiusos 2do piso",       piso: "2do Piso"    },
      { espacio: "Centro de Atención planta baja",    piso: "Planta Baja" },
      { espacio: "Centro de Atención 1er piso",       piso: "1er Piso"    },
      { espacio: "Centro de Atención 2do piso",       piso: "2do Piso"    },
      { espacio: "Anexo Norte"                                            },
      { espacio: "Edificio de Servicios planta baja", piso: "Planta Baja" },
      { espacio: "Edificio de Servicios 1er piso",    piso: "1er Piso"    },
      { espacio: "Edificio de Servicios 2do piso",    piso: "2do Piso"    },
      { espacio: "Área de Extensión"                                      },
      { espacio: "Torre Administrativa planta baja",  piso: "Planta Baja" },
      { espacio: "Torre Administrativa 1er piso",     piso: "1er Piso"    },
      { espacio: "Torre Administrativa 2do piso",     piso: "2do Piso"    },
      { espacio: "Kiosco Norte"                                           },
      { espacio: "Kiosco Oriente"                                         },
      { espacio: "Mixto"                                                  },
      { espacio: "Multigénero"                                            },
      { espacio: "Laboratorio 1"                                          },
      { espacio: "Laboratorio 2"                                          },
      { espacio: "Laboratorio 3 planta baja",         piso: "Planta Baja" },
      { espacio: "Laboratorio 3 1er piso",            piso: "1er Piso"    },
      { espacio: "Laboratorio 3 2do piso",            piso: "2do Piso"    },
      { espacio: "Laboratorio 4"                                          },
      { espacio: "Sala de personal"                                       },
      { espacio: "Auditorio principal"                                    },
    ]),
    ...forGrupo(22, 5, [
      { espacio: "Planta Baja",  piso: "Planta Baja" },
      { espacio: "Primer Piso",  piso: "1er Piso"    },
      { espacio: "Segundo Piso", piso: "2do Piso"    },
    ]),
    ...forGrupo(23, 5, [
      { espacio: "Planta Baja", piso: "Planta Baja" },
      { espacio: "Primer Piso", piso: "1er Piso"    },
    ]),
    ...forGrupo(24, 5, [
      { espacio: "PB - Atención institucional",       piso: "Planta Baja" },
      { espacio: "PB - Tutorías",                     piso: "Planta Baja" },
      { espacio: "PB - Sala principal",               piso: "Planta Baja" },
      { espacio: "PB - Soporte técnico",              piso: "Planta Baja" },
      { espacio: "1er Piso - División académica",     piso: "1er Piso"    },
      { espacio: "2do Piso - Apoyo académico",        piso: "2do Piso"    },
      { espacio: "2do Piso - Laboratorio de idiomas", piso: "2do Piso"    },
      { espacio: "2do Piso - Plataforma educativa",   piso: "2do Piso"    },
      { espacio: "2do Piso - Sala asesoría 1",        piso: "2do Piso"    },
      { espacio: "2do Piso - Sala asesoría 2",        piso: "2do Piso"    },
      { espacio: "2do Piso - Sala asesoría 3",        piso: "2do Piso"    },
      { espacio: "2do Piso - Sala asesoría 4",        piso: "2do Piso"    },
      { espacio: "2do Piso - Sala asesoría 5",        piso: "2do Piso"    },
      { espacio: "2do Piso - Sala asesoría 6",        piso: "2do Piso"    },
      { espacio: "2do Piso - Sala asesoría 7",        piso: "2do Piso"    },
      { espacio: "2do Piso - Sala asesoría 8",        piso: "2do Piso"    },
      { espacio: "2do Piso - Sala asesoría 9",        piso: "2do Piso"    },
      { espacio: "2do Piso - Sala asesoría 10",       piso: "2do Piso"    },
      { espacio: "2do Piso - Sala asesoría 11",       piso: "2do Piso"    },
      { espacio: "2do Piso - Sala asesoría 12",       piso: "2do Piso"    },
      { espacio: "2do Piso - Sala asesoría 13",       piso: "2do Piso"    },
      { espacio: "2do Piso - Sala de juntas",         piso: "2do Piso"    },
      { espacio: "2do Piso - Sala de profesores",     piso: "2do Piso"    },
      { espacio: "2do Piso - Sistemas",               piso: "2do Piso"    },
    ]),
    ...forGrupo(25, 5, [
      { espacio: "PB - Educación continua",      piso: "Planta Baja" },
      { espacio: "PB - Sala A",                  piso: "Planta Baja" },
      { espacio: "PB - Sala B",                  piso: "Planta Baja" },
      { espacio: "PB - Sala C",                  piso: "Planta Baja" },
      { espacio: "PB - Sala D",                  piso: "Planta Baja" },
      { espacio: "PB - Sala E",                  piso: "Planta Baja" },
      { espacio: "1er Piso - Sala F",            piso: "1er Piso"    },
      { espacio: "1er Piso - Sala G",            piso: "1er Piso"    },
      { espacio: "1er Piso - Modalidad abierta", piso: "1er Piso"    },
      { espacio: "2do Piso - Centro de idiomas", piso: "2do Piso"    },
      { espacio: "2do Piso - Sala H",            piso: "2do Piso"    },
      { espacio: "2do Piso - Sala I",            piso: "2do Piso"    },
    ]),
    ...forGrupo(26, 6, [
      { espacio: "Planta Baja",                   piso: "Planta Baja" },
      { espacio: "Primer Piso",                   piso: "1er Piso"    },
      { espacio: "Segundo Piso",                  piso: "2do Piso"    },
      { espacio: "Área deportiva administrativa"                      },
      { espacio: "Gimnasio cubierto"                                  },
      { espacio: "Canchas exteriores"                                 },
      { espacio: "Sala cultural"                                      },
    ]),
    ...forGrupo(27, 6, [
      { espacio: "Zona deportiva"              },
      { espacio: "Plaza Norte"                 },
      { espacio: "Plaza Sur"                   },
      { espacio: "Explanada central"           },
      { espacio: "Jardín académico"            },
      { espacio: "Punto de apoyo estudiantil"  },
    ]),
  ];

  const { count: totalEspacios } = await prisma.espacio.createMany({ data: espacios });

  // ── Usuarios ─────────────────────────────────────────────────────────────────
  const pwd = await bcrypt.hash("123456", 10);

  // Admin (área General)
  await prisma.user.create({
    data: {
      email:    "admin@faciltrack.local",
      name:     "Administrador",
      password: pwd,
      role:     "ADMIN",
      areaId:   generalArea.id,
    },
  });

  // Jefe de área + Técnico por cada área de responsabilidad (excepto General)
  const areasConUsuarios = DEFAULT_AREAS.filter((n) => n !== "General");
  const createdCredentials: string[] = [];

  for (const areaNombre of areasConUsuarios) {
    const area = await prisma.area.findUniqueOrThrow({ where: { nombre: areaNombre } });
    const slug = toSlug(areaNombre);

    await prisma.user.createMany({
      data: [
        {
          email:    `jefe.${slug}@faciltrack.local`,
          name:     `Jefe de ${areaNombre}`,
          password: pwd,
          role:     "STAFF",
          areaId:   area.id,
        },
        {
          email:    `tecnico.${slug}@faciltrack.local`,
          name:     `Técnico ${areaNombre}`,
          password: pwd,
          role:     "TECNICO",
          areaId:   area.id,
        },
      ],
    });

    createdCredentials.push(
      `   jefe.${slug}@faciltrack.local`,
      `   tecnico.${slug}@faciltrack.local`,
    );
  }

  const totalUsuarios = 1 + areasConUsuarios.length * 2;

  console.log("\n✅ Seed completado");
  console.log(`   • ${DEFAULT_AREAS.length} áreas responsables`);
  console.log("   • 6 tipos de espacio");
  console.log("   • 27 grupos");
  console.log(`   • ${totalEspacios} espacios`);
  console.log(`   • ${totalUsuarios} usuarios\n`);
  console.log("─── Credenciales (contraseña: 123456) ───────────────────────");
  console.log("   admin@faciltrack.local              (ADMIN)");
  createdCredentials.forEach((c) => console.log(c));
  console.log("─────────────────────────────────────────────────────────────\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
