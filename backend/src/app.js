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
app.use(cors());
app.use(express.json());

app.use('/api/plantas', plantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/smart', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend de Vivero Inteligente corriendo en puerto ${PORT}`);
});
