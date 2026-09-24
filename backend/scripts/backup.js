// Ejecuta: npm run db:backup. Requiere pg_dump instalado y BACKUP_DIR configurado.
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const destination = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
fs.mkdirSync(destination, { recursive: true });
const output = path.join(destination, `viverosmart-${new Date().toISOString().replace(/[:.]/g, '-')}.sql`);
execFile('pg_dump', ['--dbname', process.env.DATABASE_URL, '--file', output], error => {
  if (error) { console.error('Falló el respaldo:', error.message); process.exitCode = 1; return; }
  console.log(`Respaldo creado: ${output}`);
});
