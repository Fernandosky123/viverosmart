const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.crop.deleteMany({
    where: {
      OR: [
        { name: { contains: 'Orqu' } },
        { species: { contains: 'Orqu' } }
      ]
    }
  });
  console.log('Orquideas eliminadas');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
