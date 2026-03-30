import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed tipos de espacio
  const tipos = await Promise.all([
    prisma.tipoEspacio.upsert({
      where: { id: 1 },
      update: {},
      create: { nombre: "Aulas" },
    }),
    prisma.tipoEspacio.upsert({
      where: { id: 2 },
      update: {},
      create: { nombre: "Baños" },
    }),
    prisma.tipoEspacio.upsert({
      where: { id: 3 },
      update: {},
      create: { nombre: "Laboratorios" },
    }),
    prisma.tipoEspacio.upsert({
      where: { id: 4 },
      update: {},
      create: { nombre: "Áreas Comunes" },
    }),
    prisma.tipoEspacio.upsert({
      where: { id: 5 },
      update: {},
      create: { nombre: "Oficinas" },
    }),
  ]);

  // Seed grupos (edificios)
  const grupos = await Promise.all([
    prisma.grupo.upsert({
      where: { id: 1 },
      update: {},
      create: { nombre: "Edificio A" },
    }),
    prisma.grupo.upsert({
      where: { id: 2 },
      update: {},
      create: { nombre: "Edificio B" },
    }),
    prisma.grupo.upsert({
      where: { id: 3 },
      update: {},
      create: { nombre: "Edificio C" },
    }),
    prisma.grupo.upsert({
      where: { id: 4 },
      update: {},
      create: { nombre: "Pabellón Principal" },
    }),
  ]);

  // Seed espacios
  const espacios = await Promise.all([
    prisma.espacio.upsert({
      where: { id: 1 },
      update: {},
      create: { espacio: "Aula 101", idGrupo: 1, idTipoEspacio: 1 },
    }),
    prisma.espacio.upsert({
      where: { id: 2 },
      update: {},
      create: { espacio: "Aula 102", idGrupo: 1, idTipoEspacio: 1 },
    }),
    prisma.espacio.upsert({
      where: { id: 3 },
      update: {},
      create: { espacio: "Aula 201", idGrupo: 2, idTipoEspacio: 1 },
    }),
    prisma.espacio.upsert({
      where: { id: 4 },
      update: {},
      create: { espacio: "Baño Planta Baja", idGrupo: 1, idTipoEspacio: 2 },
    }),
    prisma.espacio.upsert({
      where: { id: 5 },
      update: {},
      create: { espacio: "Baño Segundo Piso", idGrupo: 2, idTipoEspacio: 2 },
    }),
    prisma.espacio.upsert({
      where: { id: 6 },
      update: {},
      create: { espacio: "Lab. Cómputo", idGrupo: 3, idTipoEspacio: 3 },
    }),
    prisma.espacio.upsert({
      where: { id: 7 },
      update: {},
      create: { espacio: "Lab. Ciencias", idGrupo: 3, idTipoEspacio: 3 },
    }),
    prisma.espacio.upsert({
      where: { id: 8 },
      update: {},
      create: { espacio: "Patio Central", idGrupo: 4, idTipoEspacio: 4 },
    }),
    prisma.espacio.upsert({
      where: { id: 9 },
      update: {},
      create: { espacio: "Dirección", idGrupo: 4, idTipoEspacio: 5 },
    }),
  ]);

  // Seed usuarios
  const adminPassword = await bcrypt.hash("admin123", 10);
  const staffPassword = await bcrypt.hash("staff123", 10);

  await prisma.user.upsert({
    where: { email: "admin@faciltrack.local" },
    update: {},
    create: {
      email: "admin@faciltrack.local",
      name: "Administrador",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "staff@faciltrack.local" },
    update: {},
    create: {
      email: "staff@faciltrack.local",
      name: "Personal Staff",
      password: staffPassword,
      role: "STAFF",
    },
  });

  await prisma.user.upsert({
    where: { email: "tecnico@faciltrack.local" },
    update: {},
    create: {
      email: "tecnico@faciltrack.local",
      name: "Técnico Mantenimiento",
      password: await bcrypt.hash("tecnico123", 10),
      role: "TECNICO",
    },
  });

  console.log("✅ Seed completado");
  console.log(`   - ${tipos.length} tipos de espacio`);
  console.log(`   - ${grupos.length} grupos/edificios`);
  console.log(`   - ${espacios.length} espacios`);
  console.log("   - 3 usuarios (admin, staff, tecnico)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
