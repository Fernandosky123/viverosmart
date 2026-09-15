const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany();
  const getRoleId = (name) => roles.find(r => r.name === name)?.id;

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('123456', salt);

  const users = [
    { name: 'Técnico Mantenimiento', email: 'tecnico@vivero.com', roleId: getRoleId('Tecnico') },
    { name: 'Operador Principal', email: 'operador@vivero.com', roleId: getRoleId('Operador') },
    { name: 'Cliente Externo', email: 'cliente@vivero.com', roleId: getRoleId('Cliente') }
  ];

  for (const user of users) {
    if (user.roleId) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: { password, roleId: user.roleId },
        create: { name: user.name, email: user.email, password, roleId: user.roleId }
      });
      console.log(`Usuario creado: ${user.email} (Rol: ${user.roleId})`);
    }
  }
}

main().finally(() => prisma.$disconnect());
