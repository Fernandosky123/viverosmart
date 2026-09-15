const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      include: { role: true }
    });
    // Removemos la contraseña por seguridad
    const safeUsers = users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role.name }));
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, roleId: parseInt(roleId) }
    });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getUsers, getRoles, createUser };
