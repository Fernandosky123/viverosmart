const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const role = await prisma.role.upsert({
    where: { name: 'Cliente' },
    update: {},
    create: { name: 'Cliente' }
  });

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('cliente123', salt);

  const cNorte = await prisma.user.upsert({
    where: { email: 'norte@vivero.com' },
    update: { password, roleId: role.id },
    create: { name: 'Cliente Norte', email: 'norte@vivero.com', password, roleId: role.id }
  });

  const cSur = await prisma.user.upsert({
    where: { email: 'sur@vivero.com' },
    update: { password, roleId: role.id },
    create: { name: 'Cliente Sur', email: 'sur@vivero.com', password, roleId: role.id }
  });

  const sNorte = await prisma.sector.findUnique({ where: { name: 'Invernadero Norte' } });
  const sSur = await prisma.sector.findUnique({ where: { name: 'Semilleros Sur' } });

  await prisma.crop.createMany({
    data: [
      { name: 'Tomates Norte', stage: 'Floración', sectorId: sNorte.id, userId: cNorte.id },
      { name: 'Girasol Sur', stage: 'Brote', sectorId: sSur.id, userId: cSur.id }
    ]
  });

  console.log('Clientes Norte/Sur creados exitosamente');
}

main().catch(console.error).finally(()=>prisma.$disconnect());
