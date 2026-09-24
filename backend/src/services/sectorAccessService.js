async function getSectorAccess(prisma, userId) {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    include: { role: true, crops: { select: { sectorId: true } } }
  });
  if (!user) return null;
  return {
    user,
    isAdmin: user.role.name === 'Administrador',
    sectorIds: [...new Set(user.crops.map(crop => crop.sectorId))]
  };
}

function scopedSectorWhere(access, requestedSectorId) {
  if (access.isAdmin) return requestedSectorId ? Number(requestedSectorId) : undefined;
  if (requestedSectorId) return access.sectorIds.includes(Number(requestedSectorId)) ? Number(requestedSectorId) : null;
  return { in: access.sectorIds };
}

module.exports = { getSectorAccess, scopedSectorWhere };
