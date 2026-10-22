require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./db');

// Ejecuta schema.sql en Neon: crea la tabla personas (si no existe)
// Uso: npm run init-db
(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM personas');
    console.log(`Tabla personas lista en Neon. Registros: ${rows[0].total}`);
  } catch (e) {
    console.error('No se pudo inicializar la base:', e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
