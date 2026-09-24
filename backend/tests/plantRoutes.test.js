const { after, before, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const express = require('express');

// Probar el contrato HTTP sin conectar ni modificar la base de datos del usuario.
let plants;
let writes;
let reads;
let unavailable;
let sectorCount;
const prisma = {
  user: {
    async findUnique() { return { id: 1, role: { name: 'Administrador' } }; },
  },
  sector: {
    async count() { return sectorCount; },
    async findUnique({ where }) { return sectorCount > 0 && where.id === 1 ? { id: 1, name: 'Norte' } : null; },
  },
  plant: {
    async findMany() {
      if (unavailable) throw new Error('Database unavailable');
      return [...plants].sort((a, b) => a.id - b.id);
    },
    async findUnique({ where }) {
      reads.push(where.id);
      return plants.find(plant => plant.id === where.id) || null;
    },
    async create({ data }) {
      writes.push(data);
      const plant = { id: 42, ...data };
      plants.push(plant);
      return plant;
    },
  },
};

const originalLoad = Module._load;
let router;
try {
  Module._load = function (name, ...args) {
    if (name === '@prisma/client') {
      return { PrismaClient: class { constructor() { return prisma; } } };
    }
    return originalLoad.call(this, name, ...args);
  };
  router = require('../src/routes/plantRoutes');
} finally {
  Module._load = originalLoad;
}

let server;
let baseUrl;
before(async () => {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => { req.user = { id: 1 }; next(); });
  app.use('/api/plantas', router);
  server = await new Promise(resolve => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/plantas`;
});
after(() => new Promise(resolve => server.close(resolve)));
beforeEach(() => {
  plants = [];
  writes = [];
  reads = [];
  unavailable = false;
  sectorCount = 1;
});

test('un vivero vacío devuelve una lista vacía sin crear plantas automáticamente', async () => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), []);
  assert.deepEqual(writes, []);
});

test('se pueden enumerar y consultar plantas aunque el ID 1 no exista', async () => {
  plants = [
    { id: 42, name: 'Girasol', species: 'Helianthus', lat: 0, lng: 0, sectorId: 1, userId: 1 },
    { id: 7, name: 'Tomate', species: 'Solanum', lat: -17.7, lng: -63.1, sectorId: 1, userId: 1 },
  ];
  const collection = await (await fetch(baseUrl)).json();
  assert.deepEqual(collection.map(plant => plant.id), [7, 42]);
  const response = await fetch(`${baseUrl}/${collection[0].id}`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).name, 'Tomate');
  assert.deepEqual(reads, [7, 7]);
  assert.deepEqual(writes, []);
});

test('una planta eliminada devuelve 404, no un error genérico del servidor', async () => {
  const response = await fetch(`${baseUrl}/99`);
  assert.equal(response.status, 404);
});

test('los IDs malformados se rechazan antes de consultar la base de datos', async () => {
  for (const id of ['0', '-1', '7abc', '1.5', '9007199254740992']) {
    assert.equal((await fetch(`${baseUrl}/${id}`)).status, 400, id);
  }
  assert.deepEqual(reads, []);
});

test('se distingue una base de datos no disponible de una lista vacía', async () => {
  unavailable = true;
  assert.equal((await fetch(baseUrl)).status, 500);
});

test('el registro admite coordenadas cero y devuelve el ID creado', async () => {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '  Tomate  ', species: '  Solanum  ', lat: 0, lng: 0, sectorId: 1 }),
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).id, 42);
  assert.deepEqual(writes, [{ name: 'Tomate', species: 'Solanum', lat: 0, lng: 0, sectorId: 1, userId: 1 }]);
});

test('no permite registrar plantas del simulador si no existe una zona', async () => {
  sectorCount = 0;
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Tomate', species: 'Solanum', lat: 0, lng: 0, sectorId: 1 }),
  });
  assert.equal(response.status, 400);
  assert.deepEqual(writes, []);
});

test('no se registran plantas sin nombre, especie o coordenadas válidas', async () => {
  const valid = { name: 'Tomate', species: 'Solanum', lat: 0, lng: 0, sectorId: 1 };
  for (const invalid of [{ name: ' ' }, { species: '' }, { lat: 91 }, { lng: -181 }, { lat: '0' }, { lng: null }]) {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...valid, ...invalid }),
    });
    assert.equal(response.status, 400);
  }
  assert.deepEqual(writes, []);
});
