// routes/reparaciones.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const reparacionesPath = path.join(__dirname, '..', 'reparaciones.json');
if (!fs.existsSync(reparacionesPath)) fs.writeFileSync(reparacionesPath, '[]', 'utf-8');

// Helper para leer headers
function getUserInfo(req) {
  return {
    rol: (req.headers['x-role'] || '').toLowerCase(),
    email: req.headers['x-user'] || '',
    cliente: req.headers['x-cliente'] || '', // opcional, según implementación
  };
}

// ========== GET ==========
router.get('/', (req, res, next) => {
  const { rol, email, cliente } = getUserInfo(req);
  let clienteFiltro = req.query.cliente || cliente || ''; // puede venir en query o header

  fs.readFile(reparacionesPath, 'utf-8', (err, data) => {
    if (err) return next(err);
    let reparaciones = JSON.parse(data || '[]');

    if (rol === 'cliente') {
      // El campo cliente puede estar en el usuario o en el query/header
      if (!clienteFiltro) {
        return res.status(403).json({ error: 'No tienes asociado un cliente. Consulta al administrador.' });
      }
      reparaciones = reparaciones.filter(r =>
        r.cliente && r.cliente.toLowerCase() === clienteFiltro.toLowerCase()
      );
    } else if (clienteFiltro) {
      // Permite a un admin filtrar por cliente usando query param
      reparaciones = reparaciones.filter(r =>
        r.cliente && r.cliente.toLowerCase() === clienteFiltro.toLowerCase()
      );
    }

    res.json(reparaciones);
  });
});

// ========== POST ==========
router.post(
  '/',
  [
    body('codigo').notEmpty().withMessage('El campo "codigo" es obligatorio')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const nueva = req.body;
    fs.readFile(reparacionesPath, 'utf-8', (err, data) => {
      if (err) return next(err);
      const arr = JSON.parse(data || '[]');

      if (arr.some(r => r.id === nueva.id)) {
        return res.status(400).json({ error: 'ID ya existente. El ID debe ser único.' });
      }

      nueva.historial = Array.isArray(nueva.historial) ? nueva.historial : [];
      arr.push(nueva);

      fs.writeFile(reparacionesPath, JSON.stringify(arr, null, 2), err => {
        if (err) return next(err);
        res.status(201).json({ mensaje: 'Reparación agregada.' });
      });
    });
  }
);

// ========== PUT ==========
router.put('/:codigo', (req, res, next) => {
  const codigo = req.params.codigo;
  const actualizado = req.body;

  fs.readFile(reparacionesPath, 'utf-8', (err, data) => {
    if (err) return next(err);
    let arr = JSON.parse(data || '[]');
    const idx = arr.findIndex(r => r.codigo === codigo);

    if (idx === -1) {
      return res.status(404).json({ error: 'Reparación no encontrada.' });
    }

    arr[idx] = { ...arr[idx], ...actualizado };

    fs.writeFile(reparacionesPath, JSON.stringify(arr, null, 2), err => {
      if (err) return next(err);
      res.json({ mensaje: 'Reparación modificada.' });
    });
  });
});

// ========== DELETE ==========
router.delete('/:codigo', (req, res, next) => {
  const codigo = req.params.codigo;

  fs.readFile(reparacionesPath, 'utf-8', (err, data) => {
    if (err) return next(err);
    let arr = JSON.parse(data || '[]');
    const filtrado = arr.filter(r => r.codigo !== codigo);

    if (filtrado.length === arr.length) {
      return res.status(404).json({ error: 'Reparación no encontrada.' });
    }

    fs.writeFile(reparacionesPath, JSON.stringify(filtrado, null, 2), err => {
      if (err) return next(err);
      res.json({ mensaje: 'Reparación eliminada.' });
    });
  });
});

module.exports = router;
