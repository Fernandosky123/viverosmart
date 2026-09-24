const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function requirePermission(code) {
  return async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { role: { include: { permissions: { include: { permission: true } } } } } });
      if (!user) return res.status(401).json({ error: 'La cuenta ya no está disponible.' });
      if (user.role.name === 'Administrador' || user.role.permissions.some(item => item.permission.code === code)) return next();
      return res.status(403).json({ error: 'Tu rol no tiene este permiso.' });
    } catch (error) { return res.status(500).json({ error: 'No se pudo verificar el permiso.' }); }
  };
}
module.exports = requirePermission;
