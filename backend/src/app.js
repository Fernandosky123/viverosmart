require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Inicializar base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const plantRoutes = require('./routes/plantRoutes');
const authRoutes = require('./routes/authRoutes');

const apiRoutes = require('./routes/apiRoutes');

// Iniciar cron jobs
require('./jobs/cron');

const app = express();

// 2. CORS Restringido (Vulnerabilidad #2 parchada)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Cambia esto al dominio de Vercel luego
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// 1. Rate Limiting (Vulnerabilidad #1 parchada)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita a 100 peticiones por IP cada 15 min
  message: { error: 'Demasiadas peticiones desde esta IP. Inténtalo de nuevo en 15 minutos.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Más estricto para rutas de login/registro (10 intentos)
  message: { error: 'Demasiados intentos fallidos. Bloqueado temporalmente por seguridad.' }
});

app.use('/api/', limiter);
app.use('/api/auth', authLimiter);

app.use('/api/plantas', plantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/smart', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend de Vivero Inteligente corriendo en puerto ${PORT}`);
});
