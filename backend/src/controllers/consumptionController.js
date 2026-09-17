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
    const userRole = req.user.role; // Asumiendo que el middleware inyecta esto, o podemos buscarlo
    
    // Buscar rol del usuario si no viene en req.user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true, crops: true }
    });

    let whereClause = {};
    
    // Si NO es Administrador, filtramos solo por los sectores donde tiene cultivos
    if (user.role.name !== 'Administrador') {
      const userSectorIds = [...new Set(user.crops.map(c => c.sectorId))];
      whereClause = {
        sectorId: { in: userSectorIds }
      };
    }

    const consumptions = await prisma.consumption.findMany({
      where: whereClause,
      include: { sector: true, sensor: true },
      orderBy: { timestamp: 'desc' }
    });
    res.json(consumptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { registerConsumption, getConsumptions };
