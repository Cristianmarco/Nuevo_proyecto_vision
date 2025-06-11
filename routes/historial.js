const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');

const historialPath = path.join(__dirname, '..', 'historial.json');
if (!fs.existsSync(historialPath)) fs.writeFileSync(historialPath, '[]', 'utf-8');

// GET
router.get('/', (req, res, next) => {
  fs.readFile(historialPath, 'utf-8', (err, data) => {
    if (err) return next(err);
    res.json(JSON.parse(data || '[]'));
  });
});

// POST
router.post(
  '/',
  [
    body('codigo').notEmpty().withMessage('El campo "codigo" es obligatorio'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const nueva = req.body;
    fs.readFile(historialPath, 'utf-8', (err, data) => {
      if (err) return next(err);
      let arr = [];
      try { arr = JSON.parse(data); } catch { return next(new Error('Error al parsear historial')); }
      arr.push(nueva);
      fs.writeFile(historialPath, JSON.stringify(arr, null, 2), err => {
        if (err) return next(err);
        res.status(201).json({ mensaje: 'Historial agregado exitosamente.' });
      });
    });
  }
);

// DELETE - Historial
router.delete('/:codigo', (req, res, next) => {
  const codigo = req.params.codigo;
  fs.readFile(historialPath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error al leer historial.json:', err);
      return res.status(500).json({ error: 'Error al leer historial' });
    }

    let arr;
    try {
      arr = JSON.parse(data || '[]');
    } catch (parseErr) {
      console.error('Error al parsear historial.json:', parseErr);
      return res.status(500).json({ error: 'Error al parsear historial' });
    }

    const filtrado = arr.filter(r => r.codigo !== codigo);
    if (arr.length === filtrado.length) {
      return res.status(404).json({ error: 'Reparación no encontrada' });
    }

    fs.writeFile(historialPath, JSON.stringify(filtrado, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error al escribir historial.json:', writeErr);
        return res.status(500).json({ error: 'Error al escribir historial' });
      }

      res.json({ mensaje: 'Reparación eliminada de historial.' });
    });
  });
});

module.exports = router;