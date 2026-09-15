const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.role.upsert({where: {name: 'Operador'}, update: {}, create: {name: 'Operador'}});
  await prisma.role.upsert({where: {name: 'Tecnico'}, update: {}, create: {name: 'Tecnico'}});
  await prisma.role.upsert({where: {name: 'Cliente'}, update: {}, create: {name: 'Cliente'}});
  console.log('Roles añadidos');
}

main().finally(() => prisma.$disconnect());
