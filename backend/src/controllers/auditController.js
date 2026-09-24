const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function listAudits(req, res) {
  try {
    const { userId, action, from, to, limit } = req.query;
    const where = { ...(userId ? { userId: Number(userId) } : {}), ...(action ? { action: { contains: String(action), mode: 'insensitive' } } : {}), ...(from || to ? { timestamp: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}) };
    const logs = await prisma.auditLog.findMany({ where, include: { user: { select: { name: true, email: true } } }, orderBy: { timestamp: 'desc' }, take: Math.min(Number(limit) || 100, 500) });
    res.json(logs);
  } catch (error) { res.status(500).json({ error: error.message }); }
}
module.exports = { listAudits };
