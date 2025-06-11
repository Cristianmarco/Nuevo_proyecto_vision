/// routes/login.js
const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const usuariosPath = path.join(__dirname, '../data/usuarios.json'); // Ajustar según ruta real

// POST /api/login
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
  }

  // Leer usuarios desde JSON
  let usuarios;
  try {
    const data = fs.readFileSync(usuariosPath, 'utf-8');
    usuarios = JSON.parse(data);
  } catch (err) {
    console.error('Error leyendo usuarios:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }

  // Buscar usuario
  const usuario = usuarios.find(u => u.email === email);
  if (!usuario) {
    return res.status(401).json({ error: 'Usuario no encontrado.' });
  }

  // Verificar contraseña
  const passwordOk = await bcrypt.compare(password, usuario.password);
  if (!passwordOk) {
    return res.status(401).json({ error: 'Contraseña incorrecta.' });
  }

  // Guardar usuario y rol en la sesión
  req.session.user = usuario.email;
  req.session.role = usuario.rol;

  // Logs para depuración
  console.log(`🟢 Usuario ${usuario.email} logueado como ${usuario.rol}`);
  console.log(`Email recibido: ${email}`);
  console.log(`Password recibido: ${password}`);
  console.log(`Password guardado: ${usuario.password}`);

  // Respuesta
  res.status(200).json({ message: 'Login exitoso', rol: usuario.rol });
});

module.exports = router;
