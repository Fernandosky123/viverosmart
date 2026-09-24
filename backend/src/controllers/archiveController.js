const fs = require('fs/promises');
const path = require('path');
function archiveDir() { return process.env.ARCHIVE_DIR || path.join(process.cwd(), 'archives'); }
async function listArchives(req, res) { try { const names = (await fs.readdir(archiveDir())).filter(name => /^consumos-\d{4}-\d{2}-\d{2}\.json$/.test(name)).sort().reverse(); res.json(names); } catch (error) { if (error.code === 'ENOENT') return res.json([]); res.status(500).json({ error: 'No se pudieron leer los archivos históricos.' }); } }
async function readArchive(req, res) { try { const name = req.params.name; if (!/^consumos-\d{4}-\d{2}-\d{2}\.json$/.test(name)) return res.status(400).json({ error: 'Archivo inválido.' }); const content = await fs.readFile(path.join(archiveDir(), name), 'utf8'); res.json(JSON.parse(content)); } catch (error) { res.status(404).json({ error: 'Archivo histórico no encontrado.' }); } }
module.exports = { listArchives, readArchive };
