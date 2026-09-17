const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getMyCrops(req, res) {
  try {
    // req.user viene del authMiddleware
    const crops = await prisma.crop.findMany({
      where: { userId: req.user.id },
      include: { sector: true }
    });
    res.json(crops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getMyCrops };
