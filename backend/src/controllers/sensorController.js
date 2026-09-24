const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { audit } = require('../services/auditService');
const { getSectorAccess } = require('../services/sectorAccessService');

async function getAllSensors(req, res) {
  try {
    const access = await getSectorAccess(prisma, req.user.id);
    if (!access) return res.status(401).json({ error: 'La cuenta ya no está disponible.' });
    const sensors = await prisma.sensor.findMany({ where: access.isAdmin ? {} : { sectorId: { in: access.sectorIds } }, include: { sector: true } });
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createSensor(req, res) {
  try {
    const { code, type, sectorId } = req.body;
    const sensor = await prisma.sensor.create({ data: { code, type, sectorId } });
    await audit(req.user.id, 'CREATE_SENSOR', { id: sensor.id, code });
    res.json(sensor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateSensor(req, res) {
  try {
    const { code, type, status, sectorId } = req.body;
    const sensor = await prisma.sensor.update({ where: { id: Number(req.params.id) }, data: { code, type, status, sectorId: sectorId ? Number(sectorId) : undefined } });
    await audit(req.user.id, 'UPDATE_SENSOR', { id: sensor.id });
    res.json(sensor);
  } catch (error) { res.status(400).json({ error: 'No se pudo actualizar el sensor.' }); }
}

async function deleteSensor(req, res) {
  try {
    const { id } = req.params;
    await prisma.sensor.delete({ where: { id: parseInt(id) } });
    await audit(req.user.id, 'DELETE_SENSOR', { id: Number(id) });
    res.json({ message: 'Sensor eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getAllSensors, createSensor, updateSensor, deleteSensor };
