const { PrismaClient } = require('@prisma/client');
const { audit } = require('../services/auditService');
const prisma = new PrismaClient();
const { getSectorAccess } = require('../services/sectorAccessService');

function minutes(time) { const [hour, minute] = time.split(':').map(Number); return hour * 60 + minute; }
async function hasOverlap({ sectorId, type, date, time, durationMins, excludeId }) {
  const existing = await prisma.schedule.findMany({ where: { sectorId: Number(sectorId), type, ...(date ? { date: new Date(date) } : { date: null }), ...(excludeId ? { id: { not: Number(excludeId) } } : {}) } });
  const start = minutes(time), end = start + Number(durationMins);
  return existing.some(item => start < minutes(item.time) + item.durationMins && end > minutes(item.time));
}

async function listSchedules(req, res) {
  try {
    const access = await getSectorAccess(prisma, req.user.id);
    if (!access) return res.status(401).json({ error: 'La cuenta ya no está disponible.' });
    res.json(await prisma.schedule.findMany({ where: access.isAdmin ? {} : { sectorId: { in: access.sectorIds } }, include: { sector: true }, orderBy: [{ date: 'asc' }, { time: 'asc' }] }));
  }
  catch (error) { res.status(500).json({ error: error.message }); }
}
async function createSchedule(req, res) {
  try {
    const { type, time, durationMins, sectorId, date } = req.body;
    if (!['RIEGO', 'ILUMINACION'].includes(type) || !/^\d{2}:\d{2}$/.test(time) || !Number.isInteger(Number(durationMins)) || Number(durationMins) < 1 || !Number.isInteger(Number(sectorId))) return res.status(400).json({ error: 'Datos de programación inválidos.' });
    if (await hasOverlap({ sectorId, type, date, time, durationMins })) return res.status(409).json({ error: 'El horario se superpone con otra actividad del sector.' });
    const schedule = await prisma.schedule.create({ data: { type, time, durationMins: Number(durationMins), sectorId: Number(sectorId), date: date ? new Date(date) : null } });
    await audit(req.user.id, 'CREATE_SCHEDULE', { id: schedule.id, type }); res.status(201).json(schedule);
  } catch (error) { res.status(500).json({ error: error.message }); }
}
async function updateSchedule(req, res) {
  try {
    const current = await prisma.schedule.findUnique({ where: { id: Number(req.params.id) } });
    if (!current) return res.status(404).json({ error: 'Programación no encontrada.' });
    const data = { ...req.body, sectorId: req.body.sectorId ? Number(req.body.sectorId) : current.sectorId, durationMins: req.body.durationMins ? Number(req.body.durationMins) : current.durationMins, date: req.body.date ? new Date(req.body.date) : req.body.date === '' ? null : current.date };
    const candidate = { ...current, ...data };
    if (await hasOverlap({ ...candidate, excludeId: current.id })) return res.status(409).json({ error: 'El horario se superpone con otra actividad del sector.' });
    const schedule = await prisma.schedule.update({ where: { id: Number(req.params.id) }, data }); await audit(req.user.id, 'UPDATE_SCHEDULE', { id: schedule.id }); res.json(schedule);
  }
  catch (error) { res.status(400).json({ error: 'No se pudo actualizar la programación.' }); }
}
async function deleteSchedule(req, res) {
  try { await prisma.schedule.delete({ where: { id: Number(req.params.id) } }); await audit(req.user.id, 'DELETE_SCHEDULE', { id: Number(req.params.id) }); res.status(204).end(); }
  catch (error) { res.status(404).json({ error: 'Programación no encontrada.' }); }
}
module.exports = { listSchedules, createSchedule, updateSchedule, deleteSchedule };
