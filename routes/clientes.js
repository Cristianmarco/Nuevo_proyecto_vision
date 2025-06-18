const express = require('express');
const fs = require('fs');
const path = require('path');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();

const clientesPath = path.join(__dirname, '..', 'clientes.json');
if (!fs.existsSync(clientesPath)) fs.writeFileSync(clientesPath, '[]', 'utf-8');

// GET - Solo nombres para selects rápidos (opcional, si tu clientes.json tiene más info)
router.get('/', (req, res, next) => {
  fs.readFile(clientesPath, 'utf-8', (err, data) => {
    if (err) return next(err);
    let arr = [];
    try { arr = JSON.parse(data); } catch { return res.json([]); }
    res.json(arr); // <-- DEVOLVÉ LOS OBJETOS COMPLETOS
  });
});


// POST - Agregar cliente
router.post(
  '/',
  [
    body('codigo').notEmpty().withMessage('El campo "codigo" es obligatorio'),
    body('nombre').notEmpty().withMessage('El campo "nombre" es obligatorio')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const nuevo = req.body;
    fs.readFile(clientesPath, 'utf-8', (err, data) => {
      if (err) return next(err);
      let arr = [];
      try { arr = JSON.parse(data); } catch { return next(new Error('Error al parsear archivo')); }
      if (arr.find(c => c.codigo === nuevo.codigo)) {
        return res.status(400).json({ error: 'Código ya existente' });
      }
      arr.push(nuevo);
      fs.writeFile(clientesPath, JSON.stringify(arr, null, 2), err => {
        if (err) return next(err);
        res.status(201).json({ mensaje: 'Cliente agregado' });
      });
    });
  }
);

// PUT - Modificar cliente
router.put(
  '/:codigo',
  [
    param('codigo').notEmpty().withMessage('El código de la URL es obligatorio'),
    body('nombre').notEmpty().withMessage('El campo "nombre" es obligatorio')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const codigo = req.params.codigo;
    const actualizado = req.body;

    fs.readFile(clientesPath, 'utf-8', (err, data) => {
      if (err) return next(err);
      let arr = JSON.parse(data || '[]');
      const idx = arr.findIndex(c => c.codigo === codigo);

      if (idx === -1) return res.status(404).json({ error: 'Cliente no encontrado' });

      arr[idx] = actualizado;

      fs.writeFile(clientesPath, JSON.stringify(arr, null, 2), err => {
        if (err) return next(err);
        res.json({ mensaje: 'Cliente modificado' });
      });
    });
  }
);

// DELETE - Eliminar cliente
router.delete(
  '/:codigo',
  [param('codigo').notEmpty().withMessage('El código de la URL es obligatorio')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const codigo = req.params.codigo;

    fs.readFile(clientesPath, 'utf-8', (err, data) => {
      if (err) return next(err);
      let arr = JSON.parse(data || '[]');
      const filtrado = arr.filter(c => c.codigo !== codigo);

      if (arr.length === filtrado.length) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      fs.writeFile(clientesPath, JSON.stringify(filtrado, null, 2), err => {
        if (err) return next(err);
        res.json({ mensaje: 'Cliente eliminado' });
      });
    });
  }
);

module.exports = router;

