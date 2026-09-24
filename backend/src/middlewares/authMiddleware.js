const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Acceso denegado. No hay token.' });

  try {
    // 4. Peligro de Fallback Parchado
    if (!process.env.JWT_SECRET) {
      console.error('ALERTA CRÍTICA: JWT_SECRET no está configurado en .env');
      return res.status(500).json({ error: 'Error de configuración del servidor. Contacte a soporte.' });
    }
    
    const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    // Un token vencido o malformado es un problema de autenticación, no de
    // formato de la petición. El frontend usa 401 para limpiar la sesión.
    res.status(401).json({ error: 'Token no válido.' });
  }
}

module.exports = authMiddleware;
