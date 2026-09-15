const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getWeatherState } = require('../services/weatherService');
const { generateRecommendation } = require('../services/recommendationEngine');

// Función helper para obtener estado del suelo basado en %
function getSoilStateFromMoisture(moisture) {
  if (moisture <= 10) return 'seco';
  if (moisture <= 50) return 'media';
  return 'mojado';
}

// GET /api/plantas/:id — obtener estado actual de una planta
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const plant = await prisma.plant.findUnique({
      where: { id: parseInt(id) },
      include: {
        soilStates: { orderBy: { timestamp: 'desc' }, take: 1 },
        weatherStates: { orderBy: { timestamp: 'desc' }, take: 1 },
        recommendations: { orderBy: { timestamp: 'desc' }, take: 1 }
      }
    });
    
    if (!plant) return res.status(404).json({ error: 'Planta no encontrada' });
    res.json(plant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/plantas/:id/ubicacion — actualizar el pin del mapa (lat/lng)
router.post('/:id/ubicacion', async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;
    
    // 1. Actualizar planta
    const plant = await prisma.plant.update({
      where: { id: parseInt(id) },
      data: { lat, lng }
    });
    
    // 2. Obtener clima según nuevas coordenadas
    const weatherStr = await getWeatherState(lat, lng);
    
    // 3. Registrar el estado del clima
    const weather = await prisma.weatherState.create({
      data: { plantId: plant.id, state: weatherStr }
    });
    
    // 4. Actualizar recomendaciones si es posible
    const latestSoil = await prisma.soilState.findFirst({
      where: { plantId: plant.id },
      orderBy: { timestamp: 'desc' }
    });
    
    if (latestSoil) {
      const recResult = generateRecommendation(latestSoil.state, weatherStr);
      await prisma.recommendation.create({
        data: {
          plantId: plant.id,
          message: recResult.message,
          urgencyLevel: recResult.urgencyLevel
        }
      });
    }

    res.json({ message: 'Ubicación y clima actualizados', plant, weather });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/plantas/:id/clima — obtener último estado del clima
router.get('/:id/clima', async (req, res) => {
  try {
    const { id } = req.params;
    const weather = await prisma.weatherState.findFirst({
      where: { plantId: parseInt(id) },
      orderBy: { timestamp: 'desc' }
    });
    res.json(weather || { message: 'Sin registros de clima' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/plantas/:id/recomendacion — obtener recomendación actual
router.get('/:id/recomendacion', async (req, res) => {
  try {
    const { id } = req.params;
    const rec = await prisma.recommendation.findFirst({
      where: { plantId: parseInt(id) },
      orderBy: { timestamp: 'desc' }
    });
    res.json(rec || { message: 'Sin recomendaciones' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/plantas/:id/reportes — historial de reportes diarios
router.get('/:id/reportes', async (req, res) => {
  try {
    const { id } = req.params;
    const reportes = await prisma.dailyReport.findMany({
      where: { plantId: parseInt(id) },
      orderBy: { date: 'desc' }
    });
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/plantas/:id/riego — registrar un riego manual (y de paso el estado del suelo)
router.post('/:id/riego', async (req, res) => {
  try {
    const { id } = req.params;
    // Asumimos que cuando riega, la humedad sube a 100%
    const newMoisture = 100;
    const stateStr = getSoilStateFromMoisture(newMoisture);
    
    const soilState = await prisma.soilState.create({
      data: {
        plantId: parseInt(id),
        moisturePercentage: newMoisture,
        state: stateStr
      }
    });
    
    // Obtener clima actual para generar recomendación
    const latestWeather = await prisma.weatherState.findFirst({
      where: { plantId: parseInt(id) },
      orderBy: { timestamp: 'desc' }
    });
    
    if (latestWeather) {
      const recResult = generateRecommendation(stateStr, latestWeather.state);
      await prisma.recommendation.create({
        data: {
          plantId: parseInt(id),
          message: recResult.message,
          urgencyLevel: recResult.urgencyLevel
        }
      });
    }
    
    res.json({ message: 'Riego registrado correctamente', soilState });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ENDPOINT EXTRA: Cambiar humedad artificialmente (para probar)
router.post('/:id/simular-humedad', async (req, res) => {
  try {
    const { id } = req.params;
    const { moisturePercentage } = req.body;
    
    const stateStr = getSoilStateFromMoisture(moisturePercentage);
    
    const soilState = await prisma.soilState.create({
      data: {
        plantId: parseInt(id),
        moisturePercentage,
        state: stateStr
      }
    });

    const latestWeather = await prisma.weatherState.findFirst({
      where: { plantId: parseInt(id) },
      orderBy: { timestamp: 'desc' }
    });
    
    if (latestWeather) {
      const recResult = generateRecommendation(stateStr, latestWeather.state);
      await prisma.recommendation.create({
        data: {
          plantId: parseInt(id),
          message: recResult.message,
          urgencyLevel: recResult.urgencyLevel
        }
      });
    }

    res.json({ message: 'Humedad simulada', soilState });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ENDPOINT EXTRA: Crear una planta
router.post('/', async (req, res) => {
  try {
    const { name, species, lat, lng } = req.body;
    const plant = await prisma.plant.create({
      data: { name, species, lat, lng }
    });
    res.json(plant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
