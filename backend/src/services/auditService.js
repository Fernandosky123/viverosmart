const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit(userId, action, details) {
  if (!userId) return;
  // La operación principal no debe perderse si el registro de auditoría falla.
  try { await prisma.auditLog.create({ data: { userId, action, details: details ? JSON.stringify(details) : null } }); }
  catch (error) { console.error('No se pudo registrar la auditoría:', error.message); }
}

module.exports = { audit };
