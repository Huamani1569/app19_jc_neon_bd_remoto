require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Muestra en la consola cada petición que llega desde la app (útil para la demostración)
app.use((req, res, next) => {
  res.on('finish', () => console.log(`${new Date().toLocaleTimeString()}  ${req.method} ${req.originalUrl} -> ${res.statusCode}`));
  next();
});

const DNI_REGEX = /^\d{8}$/;
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validar(body) {
  const { nombres, apellidos, fecha_nacimiento, dni } = body;
  if (!nombres || !nombres.trim()) return 'Ingresa los nombres';
  if (!apellidos || !apellidos.trim()) return 'Ingresa los apellidos';
  if (!FECHA_REGEX.test(fecha_nacimiento || '')) return 'La fecha debe tener el formato AAAA-MM-DD';
  const hoy = new Date().toISOString().slice(0, 10);
  if (fecha_nacimiento > hoy) return 'La fecha de nacimiento no puede ser futura';
  if (!DNI_REGEX.test(dni || '')) return 'El DNI debe tener 8 dígitos';
  return null;
}

function responderError(res, e) {
  if (e.code === '23505') return res.status(409).json({ mensaje: 'Ya existe una persona con ese DNI' });
  if (e.code === '23514') return res.status(400).json({ mensaje: 'Datos no válidos' });
  console.error(e);
  return res.status(500).json({ mensaje: 'Error en el servidor' });
}

function idValido(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ mensaje: 'Id no válido' });
    return null;
  }
  return id;
}

app.get('/', (req, res) => res.json({ mensaje: 'API Personas - Neon' }));

// READ: lista
app.get('/api/personas', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nombres, apellidos, fecha_nacimiento, dni FROM personas ORDER BY apellidos, nombres'
    );
    res.json(rows);
  } catch (e) {
    responderError(res, e);
  }
});

// READ: una persona
app.get('/api/personas/:id', async (req, res) => {
  const id = idValido(req, res);
  if (id === null) return;
  try {
    const { rows } = await pool.query(
      'SELECT id, nombres, apellidos, fecha_nacimiento, dni FROM personas WHERE id = $1', [id]
    );
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Persona no encontrada' });
    res.json(rows[0]);
  } catch (e) {
    responderError(res, e);
  }
});

// CREATE
app.post('/api/personas', async (req, res) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ mensaje: error });
  const { nombres, apellidos, fecha_nacimiento, dni } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO personas (nombres, apellidos, fecha_nacimiento, dni)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombres, apellidos, fecha_nacimiento, dni`,
      [nombres.trim(), apellidos.trim(), fecha_nacimiento, dni]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    responderError(res, e);
  }
});

// UPDATE
app.put('/api/personas/:id', async (req, res) => {
  const id = idValido(req, res);
  if (id === null) return;
  const error = validar(req.body);
  if (error) return res.status(400).json({ mensaje: error });
  const { nombres, apellidos, fecha_nacimiento, dni } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE personas
       SET nombres = $1, apellidos = $2, fecha_nacimiento = $3, dni = $4
       WHERE id = $5
       RETURNING id, nombres, apellidos, fecha_nacimiento, dni`,
      [nombres.trim(), apellidos.trim(), fecha_nacimiento, dni, id]
    );
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Persona no encontrada' });
    res.json(rows[0]);
  } catch (e) {
    responderError(res, e);
  }
});

// DELETE
app.delete('/api/personas/:id', async (req, res) => {
  const id = idValido(req, res);
  if (id === null) return;
  try {
    const { rowCount } = await pool.query('DELETE FROM personas WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ mensaje: 'Persona no encontrada' });
    res.status(204).end();
  } catch (e) {
    responderError(res, e);
  }
});

const PORT = process.env.PORT || 3000;
// 0.0.0.0 permite que el celular entre por la IP de la PC en la red Wi-Fi
app.listen(PORT, '0.0.0.0', () => console.log(`API escuchando en http://localhost:${PORT}`));
