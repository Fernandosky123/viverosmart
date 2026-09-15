const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAlerts(req, res) {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
      include: { sector: true }
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getAlerts };
