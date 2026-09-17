const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllSectors(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true, crops: true }
    });

    let whereClause = {};
    if (user.role.name !== 'Administrador') {
      const userSectorIds = [...new Set(user.crops.map(c => c.sectorId))];
      whereClause = { id: { in: userSectorIds } };
    }

    const sectors = await prisma.sector.findMany({ 
      where: whereClause,
      include: { crops: true, sensors: true } 
    });
    res.json(sectors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createSector(req, res) {
  try {
    const { name, description } = req.body;
    const sector = await prisma.sector.create({ data: { name, description } });
    res.json(sector);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateSector(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const sector = await prisma.sector.update({
      where: { id: parseInt(id) },
      data: { name, description }
    });
    res.json(sector);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteSector(req, res) {
  try {
    const { id } = req.params;
    await prisma.sector.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Sector eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getAllSectors, createSector, updateSector, deleteSector };
