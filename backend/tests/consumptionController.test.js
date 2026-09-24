const { after, before, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const express = require('express');

// Base en memoria: el contrato HTTP se comprueba sin leer ni modificar datos reales.
let account;
let records;
let consumptionReads;
let unavailable;
let threshold;
let alerts;
const sectors = [
  { id: 3, name: 'Invernadero norte' },
  { id: 8, name: 'Invernadero sur' },
];
const sensors = [
  { id: 12, code: 'AGUA-NORTE', type: 'AGUA', sectorId: 3 },
  { id: 13, code: 'ENERGIA-SUR', type: 'ENERGIA', sectorId: 8 },
];
const prisma = {
  auditLog: { async create({ data }) { return data; } },
  user: {
    async findUnique({ where }) {
      if (unavailable) throw new Error('Database unavailable');
      return account && account.id === where.id ? account : null;
    },
  },
  consumption: {
    async findMany({ where, include, orderBy }) {
      consumptionReads++;
      let result = records.filter(record => !where.sectorId || where.sectorId.in.includes(record.sectorId));
      if (orderBy.timestamp === 'desc') result = result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return result.map(record => ({
        ...record,
        ...(include?.sector ? { sector: sectors.find(sector => sector.id === record.sectorId) } : {}),
        ...(include?.sensor ? { sensor: sensors.find(sensor => sensor.id === record.sensorId) || null } : {}),
      }));
    },
    async create({ data }) {
      const record = { id: records.length + 1, timestamp: new Date().toISOString(), ...data };
      records.push(record);
      return record;
    },
  },
  threshold: { async findUnique() { return threshold; } },
  alert: { async create({ data }) { alerts.push(data); return data; } },
};

const originalLoad = Module._load;
let controller;
try {
  Module._load = function (name, ...args) {
    if (name === '@prisma/client') {
      return { PrismaClient: class { constructor() { return prisma; } } };
    }
    return originalLoad.call(this, name, ...args);
  };
  controller = require('../src/controllers/consumptionController');
} finally {
  Module._load = originalLoad;
}

let server;
let baseUrl;
before(async () => {
  const app = express();
  app.use(express.json());
  // Simula un token vigente de Administrador; el permiso real proviene de la cuenta.
  app.use((req, res, next) => { req.user = { id: 5, role: 'Administrador' }; next(); });
  app.get('/consumos', controller.getConsumptions);
  app.post('/consumos', controller.registerConsumption);
  server = await new Promise(resolve => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/consumos`;
});
after(() => new Promise(resolve => server.close(resolve)));
beforeEach(() => {
  account = { id: 5, role: { name: 'Administrador' }, crops: [] };
  records = [
    { id: 1, resourceType: 'AGUA', quantity: 12.5, isManual: false, sectorId: 3, sensorId: 12, timestamp: '2026-09-17T10:00:00.000Z' },
    { id: 2, resourceType: 'ENERGIA', quantity: 4.75, isManual: false, sectorId: 8, sensorId: 13, timestamp: '2026-09-17T10:02:00.000Z' },
    { id: 3, resourceType: 'AGUA', quantity: 2, isManual: true, sectorId: 8, sensorId: null, timestamp: '2026-09-17T10:03:00.000Z' },
  ];
  consumptionReads = 0;
  unavailable = false;
  threshold = null;
  alerts = [];
});

test('el dashboard del administrador recibe agua y energía con sector, sensor y origen manual', async () => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.deepEqual(data.map(record => record.id), [3, 2, 1]);
  assert.equal(data.filter(record => record.resourceType === 'AGUA').reduce((sum, record) => sum + record.quantity, 0), 14.5);
  assert.equal(data.find(record => record.resourceType === 'ENERGIA').quantity, 4.75);
  assert.deepEqual(data[0].sector, sectors[1]);
  assert.equal(data[0].isManual, true);
  assert.equal(data[0].sensor, null);
  assert.deepEqual(data[1].sensor, sensors[1]);
});

test('los roles no administradores solo reciben consumos de sus sectores actuales aunque el token diga Administrador', async () => {
  for (const role of ['Cliente', 'Operador', 'Tecnico']) {
    account.role.name = role;
    account.crops = [{ sectorId: 3 }, { sectorId: 3 }];
    const response = await fetch(baseUrl);
    assert.equal(response.status, 200, role);
    assert.deepEqual((await response.json()).map(record => record.id), [1], role);
  }
});

test('una cuenta sin cultivos asignados recibe una lista vacía sin datos de otros sectores', async () => {
  account.role.name = 'Cliente';
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), []);
});

test('una cuenta eliminada con token vigente devuelve 401 sin consultar los consumos', async () => {
  account = null;
  const response = await fetch(baseUrl);
  assert.equal(response.status, 401);
  assert.match((await response.json()).error, /cuenta/);
  assert.equal(consumptionReads, 0);
});

test('una caída de la base de datos se distingue de un período sin consumos', async () => {
  unavailable = true;
  const response = await fetch(baseUrl);
  assert.equal(response.status, 500);
  assert.equal(consumptionReads, 0);
});

test('un consumo manual registrado aparece en la siguiente consulta del dashboard con sus litros exactos', async () => {
  const input = { resourceType: 'AGUA', quantity: 6.25, isManual: true, sectorId: 3, sensorId: null };
  const response = await fetch(baseUrl, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  });
  assert.equal(response.status, 200);
  const created = await response.json();
  const data = await (await fetch(baseUrl)).json();
  assert.deepEqual(data.find(record => record.id === created.id), { ...created, sector: sectors[0], sensor: null });
  for (const [key, value] of Object.entries(input)) assert.equal(created[key], value);
  assert.deepEqual(alerts, []);
});

test('una lectura de sensor que supera el umbral conserva su origen y genera una alerta en su sector', async () => {
  threshold = { resourceType: 'ENERGIA', maxLimit: 10 };
  const response = await fetch(baseUrl, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resourceType: 'ENERGIA', quantity: 12.5, isManual: false, sectorId: 8, sensorId: 13 }),
  });
  assert.equal(response.status, 200);
  const created = await response.json();
  const saved = (await (await fetch(baseUrl)).json()).find(record => record.id === created.id);
  assert.equal(saved.quantity, 12.5);
  assert.equal(saved.isManual, false);
  assert.deepEqual(saved.sensor, sensors[1]);
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].sectorId, 8);
  assert.equal(alerts[0].resourceType, 'ENERGIA');
});
