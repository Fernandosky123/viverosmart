const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // 1. Crear Role y User
  const role = await prisma.role.upsert({
    where: { name: 'Administrador' },
    update: {},
    create: { name: 'Administrador' },
  });

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('admin123', salt);

  await prisma.user.upsert({
    where: { email: 'admin@vivero.com' },
    update: { password, roleId: role.id },
    create: { name: 'Administrador Global', email: 'admin@vivero.com', password, roleId: role.id },
  });

  // 2. Crear Sectores Iniciales
  const sectorNorte = await prisma.sector.upsert({
    where: { name: 'Invernadero Norte' },
    update: {},
    create: { name: 'Invernadero Norte', description: 'Zona de plantas tropicales y alta humedad' },
  });

  const sectorSur = await prisma.sector.upsert({
    where: { name: 'Semilleros Sur' },
    update: {},
    create: { name: 'Semilleros Sur', description: 'Zona de germinación controlada' },
  });

  // 3. Crear Sensores IoT (Para el simulador)
  await prisma.sensor.upsert({
    where: { code: 'SN-AGUA-01' },
    update: {},
    create: { code: 'SN-AGUA-01', type: 'AGUA', sectorId: sectorNorte.id },
  });

  await prisma.sensor.upsert({
    where: { code: 'SN-ELEC-01' },
    update: {},
    create: { code: 'SN-ELEC-01', type: 'ENERGIA', sectorId: sectorNorte.id },
  });

  await prisma.sensor.upsert({
    where: { code: 'SN-AGUA-02' },
    update: {},
    create: { code: 'SN-AGUA-02', type: 'AGUA', sectorId: sectorSur.id },
  });

  // 4. Crear Umbrales Base
  await prisma.threshold.upsert({
    where: { resourceType: 'AGUA' },
    update: {},
    create: { resourceType: 'AGUA', maxLimit: 30 }, // Litros por pulso simulado
  });
  await prisma.threshold.upsert({
    where: { resourceType: 'ENERGIA' },
    update: {},
    create: { resourceType: 'ENERGIA', maxLimit: 40 }, // kWh
  });

  console.log("¡Semilla comercial inyectada! (Sectores, Sensores, Roles y Umbrales)");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
