const express = require('express');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const reparacionesPath = path.join(__dirname, '..', 'reparaciones.json');
if (!fs.existsSync(reparacionesPath)) fs.writeFileSync(reparacionesPath, '[]', 'utf-8');

// ========== GET ==========
router.get('/', (req, res, next) => {
  const cliente = req.query.cliente; // filtro opcional
  fs.readFile(reparacionesPath, 'utf-8', (err, data) => {
    if (err) return next(err);
    let reparaciones = JSON.parse(data || '[]');

    if (cliente) {
      reparaciones = reparaciones.filter(r =>
        r.cliente.toLowerCase() === cliente.toLowerCase()
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

