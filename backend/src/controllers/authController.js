const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/mailService');
const { z } = require('zod');
const prisma = new PrismaClient();

// 5. Validación de Datos (Zod)
const loginSchema = z.object({
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida')
});

const initialAdminSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(100)
});

async function login(req, res) {
  try {
    // Validar input antes de tocar la DB
    const parsedData = loginSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ error: parsedData.error.errors[0].message });
    }
    const { email, password } = parsedData.data;

    const user = await prisma.user.findUnique({ where: { email }, include: { role: { include: { permissions: { include: { permission: true } } } } } });
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

    res.json({ token, user: { id: user.id, name: user.name, role: user.role.name, permissions: user.role.permissions.map(item => item.permission.code) } });
  } catch (error) {
    console.error('Login Error:', error.message);
    // 3. Fuga de Errores Parchada (Ocultamos el error real al cliente)
    res.status(500).json({ error: 'Ocurrió un error inesperado. Intente más tarde.' });
  }
}

async function setupStatus(req, res) {
  try {
    res.json({ needsInitialSetup: (await prisma.user.count()) === 0 });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo consultar la configuración inicial.' });
  }
}

async function setupInitialAdmin(req, res) {
  try {
    const parsedData = initialAdminSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ error: parsedData.error.errors[0].message });
    }
    const { name, email, password } = parsedData.data;

    if (await prisma.user.count()) return res.status(403).json({ error: 'La configuración inicial ya fue completada.' });

    const role = await prisma.role.upsert({ where: { name: 'Administrador' }, update: {}, create: { name: 'Administrador' } });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashedPassword, roleId: role.id } });

    res.status(201).json({ message: 'Administrador inicial creado.', user: { id: user.id, name: user.name } });
  } catch (error) {
    console.error('Initial setup error:', error.message);
    res.status(500).json({ error: 'No se pudo crear el administrador inicial.' });
  }
}

async function requestPasswordReset(req, res) {
  try {
    const parsed = z.string().email().safeParse(req.body?.email);
    if (!parsed.success) return res.status(400).json({ error: 'Correo inválido.' });
    const user = await prisma.user.findUnique({ where: { email: parsed.data } });
    if (!user) return res.json({ message: 'Si existe una cuenta, se enviaron instrucciones.' });
    const rawToken = crypto.randomBytes(32).toString('hex');
    await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: crypto.createHash('sha256').update(rawToken).digest('hex'), expiresAt: new Date(Date.now() + 3600000) } });
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/restablecer-contrasena?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, url);
    res.json({ message: 'Si existe una cuenta, se enviaron instrucciones.' });
  } catch (error) { res.status(500).json({ error: 'No se pudo procesar la solicitud.' }); }
}
async function resetPassword(req, res) {
  try {
    const parsed = z.object({ token: z.string().min(32), password: z.string().min(8).max(100) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Solicitud inválida.' });
    const tokenHash = crypto.createHash('sha256').update(parsed.data.token).digest('hex');
    const reset = await prisma.passwordResetToken.findFirst({ where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } } });
    if (!reset) return res.status(400).json({ error: 'El enlace no es válido o venció.' });
    await prisma.$transaction([prisma.user.update({ where: { id: reset.userId }, data: { password: await bcrypt.hash(parsed.data.password, 10) } }), prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } })]);
    res.json({ message: 'Contraseña actualizada.' });
  } catch (error) { res.status(500).json({ error: 'No se pudo actualizar la contraseña.' }); }
}

module.exports = { login, setupStatus, setupInitialAdmin, requestPasswordReset, resetPassword };
