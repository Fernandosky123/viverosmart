const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
const { audit } = require('../services/auditService');

async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      include: { role: true }
    });
    // Removemos la contraseña por seguridad
    const safeUsers = users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role.name, roleId: u.roleId }));
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getRoles(req, res) {
  try {
    const roles = await prisma.role.findMany();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, password, roleId } = req.body;
    if (typeof name !== 'string' || name.trim().length < 3 || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || typeof password !== 'string' || password.length < 8 || !Number.isInteger(Number(roleId))) return res.status(400).json({ error: 'Datos de usuario inválidos; la contraseña debe tener al menos 8 caracteres.' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, roleId: parseInt(roleId) }
    });
    await audit(req.user.id, 'CREATE_USER', { id: user.id, email: user.email });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateUser(req, res) {
  try {
    const { name, email, password, roleId } = req.body;
    const data = { name, email, roleId: roleId ? Number(roleId) : undefined };
    if (password) data.password = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({ where: { id: Number(req.params.id) }, data });
    await audit(req.user.id, 'UPDATE_USER', { id: user.id });
    res.json({ id: user.id, name: user.name, email: user.email, roleId: user.roleId });
  } catch (error) { res.status(400).json({ error: 'No se pudo actualizar el usuario.' }); }
}
async function deleteUser(req, res) {
  try {
    if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta.' });
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    await audit(req.user.id, 'DELETE_USER', { id: Number(req.params.id) }); res.status(204).end();
  } catch (error) { res.status(404).json({ error: 'Usuario no encontrado.' }); }
}

module.exports = { getUsers, getRoles, createUser, updateUser, deleteUser };
