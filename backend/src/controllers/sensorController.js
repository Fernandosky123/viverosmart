const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllSensors(req, res) {
  try {
    const sensors = await prisma.sensor.findMany({ include: { sector: true } });
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createSensor(req, res) {
  try {
    const { code, type, sectorId } = req.body;
    const sensor = await prisma.sensor.create({ data: { code, type, sectorId } });
    res.json(sensor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteSensor(req, res) {
  try {
    const { id } = req.params;
    await prisma.sensor.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Sensor eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getAllSensors, createSensor, deleteSensor };
