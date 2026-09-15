const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function registerConsumption(req, res) {
  try {
    const { resourceType, quantity, isManual, sectorId, sensorId } = req.body;
    
    // 1. Registrar consumo
    const consumption = await prisma.consumption.create({
      data: { resourceType, quantity, isManual, sectorId, sensorId }
    });

    // 2. Verificar umbrales para Alertas
    const threshold = await prisma.threshold.findUnique({ where: { resourceType } });
    if (threshold && quantity > threshold.maxLimit) {
      await prisma.alert.create({
        data: {
          resourceType,
          level: 'CRITICA',
          reason: `Consumo excesivo: ${quantity} superó el límite de ${threshold.maxLimit}`,
          sectorId
        }
      });
    }

    res.json(consumption);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getConsumptions(req, res) {
  try {
    const consumptions = await prisma.consumption.findMany({
      include: { sector: true, sensor: true },
      orderBy: { timestamp: 'desc' }
    });
    res.json(consumptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { registerConsumption, getConsumptions };
