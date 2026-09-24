const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorize');
const requirePermission = require('../middlewares/requirePermission');
const { getAllSectors, createSector, updateSector, deleteSector } = require('../controllers/sectorController');
const { getAllSensors, createSensor, updateSensor, deleteSensor } = require('../controllers/sensorController');
const { registerConsumption, getConsumptions, getConsumptionSummary, compareConsumptions, getConsolidatedConsumptions, compareSectors, getAnomalies, resolveAnomaly } = require('../controllers/consumptionController');
const { getUsers, getRoles, createUser, updateUser, deleteUser } = require('../controllers/userController');

// Protegemos todas las rutas con JWT
router.use(authMiddleware);

// Rutas de Usuarios y Roles
router.get('/usuarios', requirePermission('USERS_MANAGE'), getUsers);
router.post('/usuarios', requirePermission('USERS_MANAGE'), createUser);
router.put('/usuarios/:id', requirePermission('USERS_MANAGE'), updateUser);
router.delete('/usuarios/:id', requirePermission('USERS_MANAGE'), deleteUser);
router.get('/roles', requirePermission('ROLES_MANAGE'), getRoles);
const { listPermissions, listRolesWithPermissions, updateRolePermissions, createRole, updateRole, deleteRole } = require('../controllers/roleController');
router.get('/permisos', requirePermission('ROLES_MANAGE'), listPermissions);
router.get('/roles/permisos', requirePermission('ROLES_MANAGE'), listRolesWithPermissions);
router.put('/roles/:id/permisos', requirePermission('ROLES_MANAGE'), updateRolePermissions);
router.post('/roles', requirePermission('ROLES_MANAGE'), createRole);
router.put('/roles/:id', requirePermission('ROLES_MANAGE'), updateRole);
router.delete('/roles/:id', requirePermission('ROLES_MANAGE'), deleteRole);

// Rutas de Sectores
router.get('/sectores', getAllSectors);
router.post('/sectores', requirePermission('SECTORS_MANAGE'), createSector);
router.put('/sectores/:id', requirePermission('SECTORS_MANAGE'), updateSector);
router.delete('/sectores/:id', requirePermission('SECTORS_MANAGE'), deleteSector);

// Rutas de Sensores
router.get('/sensores', getAllSensors);
router.post('/sensores', requirePermission('SENSORS_MANAGE'), createSensor);
router.put('/sensores/:id', requirePermission('SENSORS_MANAGE'), updateSensor);
router.delete('/sensores/:id', requirePermission('SENSORS_MANAGE'), deleteSensor);

// Rutas de Cultivos
const { getMyCrops, listCrops, createCrop, updateCrop, deleteCrop } = require('../controllers/cropController');
router.get('/mis-plantas', getMyCrops);
router.get('/cultivos', listCrops);
router.post('/cultivos', requirePermission('CROPS_MANAGE'), createCrop);
router.put('/cultivos/:id', requirePermission('CROPS_MANAGE'), updateCrop);
router.delete('/cultivos/:id', requirePermission('CROPS_MANAGE'), deleteCrop);

// Rutas de Consumos
router.get('/consumos', getConsumptions);
router.post('/consumos', requirePermission('CONSUMPTIONS_REGISTER'), registerConsumption);
router.get('/consumos/resumen', getConsumptionSummary);
router.get('/consumos/comparacion', compareConsumptions);
router.get('/consumos/consolidados', requirePermission('REPORTS_VIEW'), getConsolidatedConsumptions);
router.get('/consumos/comparacion-sectores', requirePermission('REPORTS_VIEW'), compareSectors);
router.get('/anomalias', requirePermission('REPORTS_VIEW'), getAnomalies);
router.put('/anomalias/:id/resolver', requirePermission('REPORTS_VIEW'), resolveAnomaly);

// Rutas de Umbrales y Alertas
const { getThresholds, updateThresholds, deleteThreshold } = require('../controllers/thresholdController');
const { getAlerts } = require('../controllers/alertController');

router.get('/umbrales', getThresholds);
router.post('/umbrales', requirePermission('THRESHOLDS_MANAGE'), updateThresholds);
router.delete('/umbrales/:id', requirePermission('THRESHOLDS_MANAGE'), deleteThreshold);
router.get('/alertas', getAlerts);

const { listAudits } = require('../controllers/auditController');
router.get('/auditoria', requirePermission('AUDIT_VIEW'), listAudits);
const { listArchives, readArchive } = require('../controllers/archiveController');
router.get('/archivos-historicos', requirePermission('REPORTS_VIEW'), listArchives);
router.get('/archivos-historicos/:name', requirePermission('REPORTS_VIEW'), readArchive);

const { listSchedules, createSchedule, updateSchedule, deleteSchedule } = require('../controllers/scheduleController');
router.get('/programaciones', listSchedules);
router.post('/programaciones', requirePermission('SCHEDULES_MANAGE'), createSchedule);
router.put('/programaciones/:id', requirePermission('SCHEDULES_MANAGE'), updateSchedule);
router.delete('/programaciones/:id', requirePermission('SCHEDULES_MANAGE'), deleteSchedule);

module.exports = router;
