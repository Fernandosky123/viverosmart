const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { audit } = require('../services/auditService');

const defaultPermissions = [
  ['USERS_MANAGE', 'Gestionar usuarios'], ['SECTORS_MANAGE', 'Gestionar sectores'],
  ['CROPS_MANAGE', 'Gestionar cultivos'], ['SENSORS_MANAGE', 'Gestionar sensores'],
  ['CONSUMPTIONS_REGISTER', 'Registrar consumos'], ['THRESHOLDS_MANAGE', 'Gestionar umbrales'],
  ['SCHEDULES_MANAGE', 'Gestionar riego e iluminación'], ['REPORTS_VIEW', 'Consultar reportes'],
  ['ROLES_MANAGE', 'Gestionar roles y permisos'], ['AUDIT_VIEW', 'Consultar auditoría']
];

async function ensurePermissions() {
  for (const [code, description] of defaultPermissions) await prisma.permission.upsert({ where: { code }, update: { description }, create: { code, description } });
  const all = await prisma.permission.findMany({ select: { id: true, code: true } });
  const presets = {
    Administrador: all.map(p => p.id),
    Operador: all.filter(p => ['CONSUMPTIONS_REGISTER', 'SCHEDULES_MANAGE', 'CROPS_MANAGE', 'REPORTS_VIEW'].includes(p.code)).map(p => p.id),
    Tecnico: all.filter(p => ['SENSORS_MANAGE', 'REPORTS_VIEW'].includes(p.code)).map(p => p.id),
    Cliente: all.filter(p => p.code === 'REPORTS_VIEW').map(p => p.id)
  };
  for (const [name, permissionIds] of Object.entries(presets)) {
    const role = await prisma.role.upsert({ where: { name }, update: {}, create: { name }, include: { _count: { select: { permissions: true } } } });
    if (role && role._count.permissions === 0) await prisma.role.update({ where: { id: role.id }, data: { permissions: { create: permissionIds.map(permissionId => ({ permissionId })) } } });
  }
}

async function listPermissions(req, res) { try { await ensurePermissions(); res.json(await prisma.permission.findMany({ orderBy: { code: 'asc' } })); } catch (error) { res.status(500).json({ error: error.message }); } }
async function listRolesWithPermissions(req, res) { try { await ensurePermissions(); res.json(await prisma.role.findMany({ include: { permissions: { include: { permission: true } } }, orderBy: { name: 'asc' } })); } catch (error) { res.status(500).json({ error: error.message }); } }
async function updateRolePermissions(req, res) {
  try {
    const permissionIds = Array.isArray(req.body.permissionIds) ? req.body.permissionIds.map(Number).filter(Number.isInteger) : [];
    const role = await prisma.role.update({ where: { id: Number(req.params.id) }, data: { permissions: { deleteMany: {}, create: permissionIds.map(permissionId => ({ permissionId })) } }, include: { permissions: { include: { permission: true } } } });
    await audit(req.user.id, 'UPDATE_ROLE_PERMISSIONS', { roleId: role.id, permissionIds });
    res.json(role);
  } catch (error) { res.status(400).json({ error: 'No se pudieron actualizar los permisos.' }); }
}
async function createRole(req, res) { try { const role = await prisma.role.create({ data: { name: String(req.body.name || '').trim() } }); await audit(req.user.id, 'CREATE_ROLE', { roleId: role.id, name: role.name }); res.status(201).json(role); } catch { res.status(400).json({ error: 'No se pudo crear el rol.' }); } }
async function updateRole(req, res) { try { const role = await prisma.role.update({ where: { id: Number(req.params.id) }, data: { name: String(req.body.name || '').trim() } }); await audit(req.user.id, 'UPDATE_ROLE', { roleId: role.id }); res.json(role); } catch { res.status(400).json({ error: 'No se pudo actualizar el rol.' }); } }
async function deleteRole(req, res) { try { const role = await prisma.role.findUnique({ where: { id: Number(req.params.id) }, include: { _count: { select: { users: true } } } }); if (!role || role.name === 'Administrador') return res.status(400).json({ error: 'Ese rol no se puede eliminar.' }); if (role._count.users) return res.status(409).json({ error: 'No puedes eliminar un rol con usuarios asignados.' }); await prisma.role.delete({ where: { id: role.id } }); await audit(req.user.id, 'DELETE_ROLE', { roleId: role.id }); res.status(204).end(); } catch { res.status(400).json({ error: 'No se pudo eliminar el rol.' }); } }
module.exports = { ensurePermissions, listPermissions, listRolesWithPermissions, updateRolePermissions, createRole, updateRole, deleteRole };
