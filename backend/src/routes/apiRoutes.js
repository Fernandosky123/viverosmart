const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getAllSectors, createSector, updateSector, deleteSector } = require('../controllers/sectorController');
const { getAllSensors, createSensor, deleteSensor } = require('../controllers/sensorController');
const { registerConsumption, getConsumptions } = require('../controllers/consumptionController');
const { getUsers, getRoles, createUser } = require('../controllers/userController');

// Protegemos todas las rutas con JWT
router.use(authMiddleware);

// Rutas de Usuarios y Roles
router.get('/usuarios', getUsers);
router.post('/usuarios', createUser);
router.get('/roles', getRoles);

// Rutas de Sectores
router.get('/sectores', getAllSectors);
router.post('/sectores', createSector);
router.put('/sectores/:id', updateSector);
router.delete('/sectores/:id', deleteSector);

// Rutas de Sensores
router.get('/sensores', getAllSensors);
router.post('/sensores', createSensor);
router.delete('/sensores/:id', deleteSensor);

// Rutas de Consumos
router.get('/consumos', getConsumptions);
router.post('/consumos', registerConsumption);

// Rutas de Umbrales y Alertas
const { getThresholds, updateThresholds } = require('../controllers/thresholdController');
const { getAlerts } = require('../controllers/alertController');

router.get('/umbrales', getThresholds);
router.post('/umbrales', updateThresholds);
router.get('/alertas', getAlerts);

module.exports = router;
