const cron = require('node-cron');
const fs = require('fs/promises');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function archiveConsumptions() {
  const since = new Date(); since.setDate(since.getDate() - 1);
  const records = await prisma.consumption.findMany({ where: { timestamp: { gte: since } }, include: { sector: true } });
  const dir = process.env.ARCHIVE_DIR || path.join(process.cwd(), 'archives');
  await fs.mkdir(dir, { recursive: true });
  const day = new Date().toISOString().slice(0, 10);
  await fs.writeFile(path.join(dir, `consumos-${day}.json`), JSON.stringify(records, null, 2), 'utf8');
}

// Archivo histórico diario legible y portable. Los errores no detienen la API.
cron.schedule('10 0 * * *', () => archiveConsumptions().catch(error => console.error('Error archivando consumos:', error.message)));
module.exports = { archiveConsumptions };
