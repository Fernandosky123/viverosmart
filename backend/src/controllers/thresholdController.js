const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { audit } = require('../services/auditService');
const { getSectorAccess } = require('../services/sectorAccessService');

async function getThresholds(req, res) {
  try {
    const access = await getSectorAccess(prisma, req.user.id);
    if (!access) return res.status(401).json({ error: 'La cuenta ya no está disponible.' });
    const where = access.isAdmin ? {} : { OR: [{ sectorId: null }, { sectorId: { in: access.sectorIds } }] };
    const thresholds = await prisma.threshold.findMany({ where, include: { sector: true }, orderBy: [{ sectorId: 'asc' }, { resourceType: 'asc' }] });
    res.json(thresholds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateThresholds(req, res) {
  try {
    const { agua, energia, sectorId, warningAgua, warningEnergia } = req.body;
    
    if (agua) {
      const where = { resourceType: 'AGUA', sectorId: sectorId ? Number(sectorId) : null };
      const data = { maxLimit: parseFloat(agua), warningLimit: warningAgua ? parseFloat(warningAgua) : null };
      const existing = await prisma.threshold.findFirst({ where });
      if (existing) await prisma.threshold.update({ where: { id: existing.id }, data });
      else await prisma.threshold.create({ data: { ...where, ...data } });
    }
    
    if (energia) {
      const where = { resourceType: 'ENERGIA', sectorId: sectorId ? Number(sectorId) : null };
      const data = { maxLimit: parseFloat(energia), warningLimit: warningEnergia ? parseFloat(warningEnergia) : null };
      const existing = await prisma.threshold.findFirst({ where });
      if (existing) await prisma.threshold.update({ where: { id: existing.id }, data });
      else await prisma.threshold.create({ data: { ...where, ...data } });
    }

    await audit(req.user.id, 'UPDATE_THRESHOLDS', { sectorId: sectorId || null });
    res.json({ message: 'Umbrales actualizados' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteThreshold(req, res) { try { await prisma.threshold.delete({ where: { id: Number(req.params.id) } }); await audit(req.user.id, 'DELETE_THRESHOLD', { id: Number(req.params.id) }); res.status(204).end(); } catch { res.status(404).json({ error: 'Umbral no encontrado.' }); } }

module.exports = { getThresholds, updateThresholds, deleteThreshold };
