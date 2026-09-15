const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. GENERADOR DE REPORTES DIARIOS (A las 23:00)
cron.schedule('0 23 * * *', async () => {
  console.log('Generando reportes diarios automáticos...');
  // (Mantengo la lógica base para compatibilidad o la dejamos vacía ya que la base cambió)
});

// 2. SIMULADOR DE IOT AUTOMÁTICO (Cada 2 minutos para demostración)
cron.schedule('*/2 * * * *', async () => {
  console.log('📡 [IoT Simulator] Capturando datos de sensores automáticamente...');
  try {
    const sensors = await prisma.sensor.findMany({ where: { status: 'ACTIVO' } });
    if (sensors.length === 0) return;

    for (const sensor of sensors) {
      // Simular cantidad consumida (aleatorio entre 5 y 50)
      const quantity = Math.floor(Math.random() * 45) + 5;
      
      // Registrar consumo en base de datos
      await prisma.consumption.create({
        data: {
          resourceType: sensor.type,
          quantity: quantity,
          isManual: false,
          sectorId: sensor.sectorId,
          sensorId: sensor.id
        }
      });

      // Verificar umbrales (Motor Automático de Alertas)
      const threshold = await prisma.threshold.findUnique({ where: { resourceType: sensor.type } });
      if (threshold && quantity > threshold.maxLimit) {
        await prisma.alert.create({
          data: {
            resourceType: sensor.type,
            level: 'CRITICA',
            reason: `[Auto IoT] Sensor ${sensor.code} registró ${quantity}${sensor.type === 'AGUA' ? 'L' : 'kWh'}, superando el umbral de ${threshold.maxLimit}.`,
            sectorId: sensor.sectorId
          }
        });
        console.log(`⚠️ ALERTA: Consumo crítico en Sector ${sensor.sectorId}`);
      }
    }
  } catch (error) {
    console.error('Error en simulador IoT:', error);
  }
});
