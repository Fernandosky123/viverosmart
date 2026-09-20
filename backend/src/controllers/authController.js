const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = new PrismaClient();

// 5. Validación de Datos (Zod)
const loginSchema = z.object({
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida')
});

const registerSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(100),
  roleName: z.string().optional()
});

async function login(req, res) {
  try {
    // Validar input antes de tocar la DB
    const parsedData = loginSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ error: parsedData.error.errors[0].message });
    }
    const { email, password } = parsedData.data;

    const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
    if (!user) return res.status(400).json({ error: 'Credenciales inválidas' }); // Mensaje genérico para no confirmar correos

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: 'Credenciales inválidas' });

    // 4. Peligro de Fallback Parchado
    if (!process.env.JWT_SECRET) {
      console.error('ALERTA CRÍTICA: JWT_SECRET no configurado');
      return res.status(500).json({ error: 'Error interno del servidor. Contacte a soporte.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role.name }, process.env.JWT_SECRET, { expiresIn: '8h' });
    
    // Registrar auditoría
    await prisma.auditLog.create({
      data: { action: 'LOGIN', userId: user.id }
    });

    res.json({ token, user: { id: user.id, name: user.name, role: user.role.name } });
  } catch (error) {
    console.error('Login Error:', error.message);
    // 3. Fuga de Errores Parchada (Ocultamos el error real al cliente)
    res.status(500).json({ error: 'Ocurrió un error inesperado. Intente más tarde.' });
  }
}

async function register(req, res) {
  try {
    // Validar input
    const parsedData = registerSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ error: parsedData.error.errors[0].message });
    }
    const { name, email, password, roleName } = parsedData.data;

    // Chequear si el correo ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'El correo ya está registrado' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let role = await prisma.role.findUnique({ where: { name: roleName || 'Operador' } });
    if (!role) {
      role = await prisma.role.create({ data: { name: roleName || 'Operador' } });
    }

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, roleId: role.id }
    });
    res.json({ message: 'Usuario creado exitosamente', user: { id: user.id, name: user.name } });
  } catch (error) {
    console.error('Register Error:', error.message);
    // 3. Fuga de Errores Parchada
    res.status(500).json({ error: 'Ocurrió un error al registrar el usuario. Intente más tarde.' });
  }
}

module.exports = { login, register };
