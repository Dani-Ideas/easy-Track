import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed tipos de espacio (secuencial para respetar autoincrement)
  const tiposData = [
    { id: 1, nombre: "Aulas" },
    { id: 2, nombre: "Baños" },
    { id: 3, nombre: "Laboratorios" },
    { id: 4, nombre: "Áreas Comunes" },
    { id: 5, nombre: "Oficinas" },
  ];
  const tipos = [];
  for (const t of tiposData) {
    const item = await prisma.tipoEspacio.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    });
    tipos.push(item);
  }

  // Seed grupos (secuencial para respetar autoincrement)
  const gruposData = [
    { id: 1, nombre: "Edificio A" },
    { id: 2, nombre: "Edificio B" },
    { id: 3, nombre: "Edificio C" },
    { id: 4, nombre: "Pabellón Principal" },
  ];
  const grupos = [];
  for (const g of gruposData) {
    const item = await prisma.grupo.upsert({
      where: { id: g.id },
      update: {},
      create: g,
    });
    grupos.push(item);
  }

  // Seed espacios (secuencial para respetar foreign keys)
  const espaciosData = [
    { id: 1, espacio: "Aula 101", idGrupo: 1, idTipoEspacio: 1 },
    { id: 2, espacio: "Aula 102", idGrupo: 1, idTipoEspacio: 1 },
    { id: 3, espacio: "Aula 201", idGrupo: 2, idTipoEspacio: 1 },
    { id: 4, espacio: "Baño Planta Baja", idGrupo: 1, idTipoEspacio: 2 },
    { id: 5, espacio: "Baño Segundo Piso", idGrupo: 2, idTipoEspacio: 2 },
    { id: 6, espacio: "Lab. Cómputo", idGrupo: 3, idTipoEspacio: 3 },
    { id: 7, espacio: "Lab. Ciencias", idGrupo: 3, idTipoEspacio: 3 },
    { id: 8, espacio: "Patio Central", idGrupo: 4, idTipoEspacio: 4 },
    { id: 9, espacio: "Dirección", idGrupo: 4, idTipoEspacio: 5 },
  ];
  const espacios = [];
  for (const e of espaciosData) {
    const item = await prisma.espacio.upsert({
      where: { id: e.id },
      update: {},
      create: e,
    });
    espacios.push(item);
  }

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
