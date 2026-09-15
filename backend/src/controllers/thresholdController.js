const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getThresholds(req, res) {
  try {
    const thresholds = await prisma.threshold.findMany();
    res.json(thresholds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateThresholds(req, res) {
  try {
    const { agua, energia } = req.body;
    
    if (agua) {
      await prisma.threshold.upsert({
        where: { resourceType: 'AGUA' },
        update: { maxLimit: parseFloat(agua) },
        create: { resourceType: 'AGUA', maxLimit: parseFloat(agua) }
      });
    }
    
    if (energia) {
      await prisma.threshold.upsert({
        where: { resourceType: 'ENERGIA' },
        update: { maxLimit: parseFloat(energia) },
        create: { resourceType: 'ENERGIA', maxLimit: parseFloat(energia) }
      });
    }

    res.json({ message: 'Umbrales actualizados' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getThresholds, updateThresholds };
