const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id, role: user.role.name }, JWT_SECRET, { expiresIn: '8h' });
    
    // Registrar auditoría
    await prisma.auditLog.create({
      data: { action: 'LOGIN', userId: user.id }
    });

    res.json({ token, user: { id: user.id, name: user.name, role: user.role.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function register(req, res) {
  const { name, email, password, roleName } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buscar o crear rol
    let role = await prisma.role.findUnique({ where: { name: roleName || 'Operador' } });
    if (!role) {
      role = await prisma.role.create({ data: { name: roleName || 'Operador' } });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: role.id
      }
    });
    res.json({ message: 'Usuario creado exitosamente', user: { id: user.id, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { login, register };
