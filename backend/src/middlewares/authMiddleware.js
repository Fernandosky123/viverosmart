const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Acceso denegado. No hay token.' });

  try {
    const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'secret_key');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Token no válido.' });
  }
}

module.exports = authMiddleware;
