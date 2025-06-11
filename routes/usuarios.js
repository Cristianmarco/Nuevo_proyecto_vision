// routes/usuarios.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const router = express.Router();

const usuariosPath = path.join(__dirname, '../data/usuarios.json');

// Obtener usuarios
router.get('/', (req, res) => {
  const usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));
  res.json(usuarios);
});

// Agregar usuario
router.post('/', async (req, res) => {
  const { email, password, rol } = req.body;

  if (!email || !password || !rol) {
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  }

  let usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));

  if (usuarios.find(u => u.email === email)) {
    return res.status(400).json({ error: 'El usuario ya existe.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  usuarios.push({ email, password: hashedPassword, rol });

  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));

  res.json({ message: 'Usuario agregado exitosamente.' });
});

// Eliminar usuario
router.delete('/:email', (req, res) => {
  const email = req.params.email;
  let usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));

  usuarios = usuarios.filter(u => u.email !== email);

  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));

  res.json({ message: 'Usuario eliminado.' });
});

// Editar usuario
router.put('/:email', async (req, res) => {
  const email = req.params.email;
  const { password, rol } = req.body;

  let usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));
  const index = usuarios.findIndex(u => u.email === email);

  if (index === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
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
