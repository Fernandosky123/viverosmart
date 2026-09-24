const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAlerts(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { role: true, crops: true } });
    if (!user) return res.status(401).json({ error: 'La cuenta ya no está disponible.' });
    const { sectorId, resourceType, from, to, limit } = req.query;
    const allowed = user.role.name === 'Administrador' ? null : [...new Set(user.crops.map(c => c.sectorId))];
    const where = { ...(sectorId ? { sectorId: Number(sectorId) } : allowed ? { sectorId: { in: allowed } } : {}), ...(resourceType ? { resourceType: String(resourceType).toUpperCase() } : {}), ...(from || to ? { timestamp: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}) };
    if (sectorId && allowed && !allowed.includes(Number(sectorId))) return res.json([]);
    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: Math.min(Number(limit) || 100, 500),
      include: { sector: true }
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getAlerts };
