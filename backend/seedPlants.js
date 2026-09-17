const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cliente = await prisma.user.findUnique({ where: { email: 'cliente@vivero.com' } });
  const admin = await prisma.user.findUnique({ where: { email: 'admin@vivero.com' } });
  const sector = await prisma.sector.findFirst();

  if (cliente && sector) {
    await prisma.crop.create({
      data: { name: 'Orquídea Real', species: 'Orchidaceae', stage: 'Floración', growthPercent: 85, sectorId: sector.id, userId: cliente.id }
    });
    await prisma.crop.create({
      data: { name: 'Girasol Gigante', species: 'Helianthus', stage: 'Brote', growthPercent: 20, sectorId: sector.id, userId: cliente.id }
    });
  }

  if (admin && sector) {
    await prisma.crop.create({
      data: { name: 'Bonsái Ficus', species: 'Ficus', stage: 'Crecimiento', growthPercent: 55, sectorId: sector.id, userId: admin.id }
    });
  }
}

main().finally(() => prisma.$disconnect());
