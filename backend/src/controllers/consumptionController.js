const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { audit } = require('../services/auditService');
const { getSectorAccess } = require('../services/sectorAccessService');

async function registerConsumption(req, res) {
  try {
    const { resourceType, quantity, isManual, sectorId, sensorId, timestamp } = req.body;
    if (!['AGUA', 'ENERGIA'].includes(resourceType) || !Number.isFinite(Number(quantity)) || Number(quantity) < 0 || !Number.isInteger(Number(sectorId))) return res.status(400).json({ error: 'Lectura de consumo inválida.' });
    
    const access = await getSectorAccess(prisma, req.user.id);
    if (!access) return res.status(401).json({ error: 'La cuenta ya no está disponible.' });
    if (!access.isAdmin && !access.sectorIds.includes(Number(sectorId))) return res.status(403).json({ error: 'No tienes acceso a ese sector.' });

    // 1. Registrar consumo
    const consumption = await prisma.consumption.create({
      data: { resourceType, quantity: Number(quantity), isManual: Boolean(isManual), sectorId: Number(sectorId), sensorId: sensorId ? Number(sensorId) : null, ...(timestamp ? { timestamp: new Date(timestamp) } : {}) }
    });

    // 2. Verificar umbrales para Alertas
    const threshold = prisma.threshold.findFirst
      ? await prisma.threshold.findFirst({ where: { resourceType, OR: [{ sectorId: Number(sectorId) }, { sectorId: null }] }, orderBy: { sectorId: 'desc' } })
      : await prisma.threshold.findUnique({ where: { resourceType } });
    const level = threshold && Number(quantity) > threshold.maxLimit ? 'CRITICA' : threshold?.warningLimit && Number(quantity) > threshold.warningLimit ? 'ADVERTENCIA' : null;
    if (level) {
      await prisma.alert.create({
        data: {
          resourceType,
          level,
          reason: level === 'CRITICA' ? `Consumo excesivo: ${quantity} superó el límite de ${threshold.maxLimit}` : `Consumo elevado: ${quantity} superó la advertencia de ${threshold.warningLimit}`,
          sectorId
        }
      });
      if (prisma.consumptionAnomaly) await prisma.consumptionAnomaly.create({ data: { resourceType, quantity: Number(quantity), level, reason: level === 'CRITICA' ? 'Consumo excede el límite crítico configurado.' : 'Consumo excede el nivel de advertencia configurado.', sectorId: Number(sectorId), consumptionId: consumption.id } });
    }

    await audit(req.user.id, 'REGISTER_CONSUMPTION', { id: consumption.id, resourceType, isManual: Boolean(isManual) });

    res.json(consumption);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getConsumptions(req, res) {
  try {
    // Consultar el rol y las asignaciones actuales, aunque el token siga vigente.
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true, crops: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'La cuenta ya no está disponible. Inicia sesión nuevamente.' });
    }

    let whereClause = {};
    
    // Si NO es Administrador, filtramos solo por los sectores donde tiene cultivos
    if (user.role.name !== 'Administrador') {
      const userSectorIds = [...new Set(user.crops.map(c => c.sectorId))];
      whereClause = {
        sectorId: { in: userSectorIds }
      };
    }

    const { sectorId, resourceType, from, to, minQuantity, maxQuantity, sort = 'desc' } = req.query;
    if (sectorId) {
      const requested = Number(sectorId);
      if (user.role.name !== 'Administrador' && !user.crops.some(crop => crop.sectorId === requested)) return res.json([]);
      whereClause.sectorId = requested;
    }
    if (resourceType) whereClause.resourceType = String(resourceType).toUpperCase();
    if (from || to) whereClause.timestamp = { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) };
    if (minQuantity || maxQuantity) whereClause.quantity = { ...(minQuantity ? { gte: Number(minQuantity) } : {}), ...(maxQuantity ? { lte: Number(maxQuantity) } : {}) };

    const consumptions = await prisma.consumption.findMany({
      where: whereClause,
      include: { sector: true, sensor: true },
      orderBy: { timestamp: sort === 'asc' ? 'asc' : 'desc' }
    });
    res.json(consumptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getConsumptionSummary(req, res) {
  try {
    const { from, to, sectorId } = req.query;
    const access = await getSectorAccess(prisma, req.user.id);
    if (!access) return res.status(401).json({ error: 'La cuenta ya no está disponible.' });
    if (sectorId && !access.isAdmin && !access.sectorIds.includes(Number(sectorId))) return res.json([]);
    const where = { ...(sectorId ? { sectorId: Number(sectorId) } : !access.isAdmin ? { sectorId: { in: access.sectorIds } } : {}), ...(from || to ? { timestamp: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}) };
    const groups = await prisma.consumption.groupBy({ by: ['resourceType'], where, _sum: { quantity: true }, _count: true });
    res.json(groups.map(item => ({ resourceType: item.resourceType, total: item._sum.quantity || 0, records: item._count })));
  } catch (error) { res.status(500).json({ error: error.message }); }
}

async function compareConsumptions(req, res) {
  try {
    const { from, to, previousFrom, previousTo, sectorId, resourceType } = req.query;
    if (!from || !to || !previousFrom || !previousTo) return res.status(400).json({ error: 'Indica ambos periodos para comparar.' });
    const access = await getSectorAccess(prisma, req.user.id);
    if (!access) return res.status(401).json({ error: 'La cuenta ya no está disponible.' });
    if (sectorId && !access.isAdmin && !access.sectorIds.includes(Number(sectorId))) return res.status(403).json({ error: 'No tienes acceso a ese sector.' });
    const base = { ...(sectorId ? { sectorId: Number(sectorId) } : !access.isAdmin ? { sectorId: { in: access.sectorIds } } : {}), ...(resourceType ? { resourceType: String(resourceType).toUpperCase() } : {}) };
    const total = async (start, end) => (await prisma.consumption.aggregate({ where: { ...base, timestamp: { gte: new Date(start), lte: new Date(end) } }, _sum: { quantity: true } }))._sum.quantity || 0;
    const [current, previous] = await Promise.all([total(from, to), total(previousFrom, previousTo)]);
    res.json({ current, previous, difference: current - previous, percentage: previous ? ((current - previous) / previous) * 100 : null });
  } catch (error) { res.status(500).json({ error: error.message }); }
}

async function getConsolidatedConsumptions(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { role: true, crops: true } });
    if (!user) return res.status(401).json({ error: 'La cuenta ya no está disponible.' });
    const { period = 'day', sectorId, resourceType, from, to } = req.query;
    const where = { ...(sectorId ? { sectorId: Number(sectorId) } : {}), ...(resourceType ? { resourceType: String(resourceType).toUpperCase() } : {}), ...(from || to ? { timestamp: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}) };
    if (user.role.name !== 'Administrador') where.sectorId = { in: [...new Set(user.crops.map(c => c.sectorId))] };
    const records = await prisma.consumption.findMany({ where, orderBy: { timestamp: 'asc' } });
    const buckets = new Map();
    for (const item of records) { const date = new Date(item.timestamp); const key = period === 'month' ? `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}` : date.toISOString().slice(0,10); const entry = buckets.get(key) || { period: key, AGUA: 0, ENERGIA: 0 }; entry[item.resourceType] += item.quantity; buckets.set(key, entry); }
    res.json([...buckets.values()]);
  } catch (error) { res.status(500).json({ error: error.message }); }
}

async function compareSectors(req, res) {
  try {
    const { sectorA, sectorB, from, to, resourceType } = req.query;
    if (!sectorA || !sectorB || !from || !to) return res.status(400).json({ error: 'Indica dos sectores y un período.' });
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { role: true, crops: true } });
    const allowed = user?.role.name === 'Administrador' ? null : [...new Set(user?.crops.map(c => c.sectorId) || [])];
    if (allowed && (!allowed.includes(Number(sectorA)) || !allowed.includes(Number(sectorB)))) return res.status(403).json({ error: 'No tienes acceso a ambos sectores.' });
    const total = async sectorId => (await prisma.consumption.aggregate({ where: { sectorId: Number(sectorId), ...(resourceType ? { resourceType: String(resourceType).toUpperCase() } : {}), timestamp: { gte: new Date(from), lte: new Date(to) } }, _sum: { quantity: true } }))._sum.quantity || 0;
    const [a,b]=await Promise.all([total(sectorA),total(sectorB)]); res.json({ sectorA: Number(sectorA), sectorB: Number(sectorB), totalA:a, totalB:b, difference:a-b, percentage: b ? ((a-b)/b)*100 : null });
  } catch (error) { res.status(500).json({ error: error.message }); }
}

async function getAnomalies(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { role: true, crops: true } });
    if (!user) return res.status(401).json({ error: 'La cuenta ya no está disponible.' });
    const { sectorId, resourceType, unresolved } = req.query;
    const allowed = user.role.name === 'Administrador' ? null : [...new Set(user.crops.map(c => c.sectorId))];
    const where = { ...(sectorId ? { sectorId: Number(sectorId) } : allowed ? { sectorId: { in: allowed } } : {}), ...(resourceType ? { resourceType: String(resourceType).toUpperCase() } : {}), ...(unresolved === 'true' ? { resolvedAt: null } : {}) };
    if (sectorId && allowed && !allowed.includes(Number(sectorId))) return res.json([]);
    res.json(await prisma.consumptionAnomaly.findMany({ where, include: { sector: true, consumption: true }, orderBy: { timestamp: 'desc' }, take: 300 }));
  } catch (error) { res.status(500).json({ error: error.message }); }
}
async function resolveAnomaly(req, res) { try { const anomaly = await prisma.consumptionAnomaly.update({ where: { id: Number(req.params.id) }, data: { resolvedAt: new Date() } }); await audit(req.user.id, 'RESOLVE_ANOMALY', { id: anomaly.id }); res.json(anomaly); } catch { res.status(404).json({ error: 'Anomalía no encontrada.' }); } }

module.exports = { registerConsumption, getConsumptions, getConsumptionSummary, compareConsumptions, getConsolidatedConsumptions, compareSectors, getAnomalies, resolveAnomaly };
