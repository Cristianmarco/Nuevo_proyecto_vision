// routes/usuarios.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { checkRole } = require('../middleware/auth'); // <--- Importa el middleware

const usuariosPath = path.join(__dirname, '../data/usuarios.json');

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

const ROLES_VALIDOS = ['admin', 'cliente'];

// Sólo ADMIN puede gestionar usuarios

// Obtener usuarios (NO devuelve password nunca)
router.get('/', checkRole('admin'), (req, res) => {
  const usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));
  const safeUsers = usuarios.map(u => ({ email: u.email, rol: u.rol }));
  res.json(safeUsers);
});

// Agregar usuario (solo admin)
router.post('/', checkRole('admin'), async (req, res) => {
  let { email, password, rol, cliente } = req.body;
  email = normalizeEmail(email);

  if (!email || !password || !rol) {
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  }
  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido.' });
  }

  let usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));

  if (usuarios.find(u => normalizeEmail(u.email) === email)) {
    return res.status(400).json({ error: 'El usuario ya existe.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Solo agregar campo cliente si es usuario cliente
  const nuevoUsuario = rol === "cliente"
    ? { email, password: hashedPassword, rol, cliente }
    : { email, password: hashedPassword, rol };

  usuarios.push(nuevoUsuario);

  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
  res.json({ message: 'Usuario agregado exitosamente.' });
});

// Eliminar usuario (solo admin)
router.delete('/:email', checkRole('admin'), (req, res) => {
  const email = normalizeEmail(req.params.email);
  let usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));

  const prevLength = usuarios.length;
  usuarios = usuarios.filter(u => normalizeEmail(u.email) !== email);

  if (usuarios.length === prevLength) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
  res.json({ message: 'Usuario eliminado.' });
});

router.put('/:email', checkRole('admin'), async (req, res) => {
  const email = normalizeEmail(req.params.email);
  let { password, rol } = req.body;

  let usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));
  const index = usuarios.findIndex(u => normalizeEmail(u.email) === email);

  if (index === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  if (rol && !ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido.' });
  }

  if (password) {
    usuarios[index].password = await bcrypt.hash(password, 10);
  }
  if (rol) {
    usuarios[index].rol = rol;
  }

  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
  res.json({ message: 'Usuario actualizado exitosamente.' });
});

module.exports = router;
