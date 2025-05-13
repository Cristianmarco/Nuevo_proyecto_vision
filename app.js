const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Rutas de archivos
const clientesPath = path.join(__dirname, 'clientes.json');
const stockPath = path.join(__dirname, 'stock.json');
const entregadasPath = path.join(__dirname, 'entregadas.json');

// Crear archivos si no existen
if (!fs.existsSync(clientesPath)) fs.writeFileSync(clientesPath, '[]', 'utf-8');
if (!fs.existsSync(stockPath)) fs.writeFileSync(stockPath, '[]', 'utf-8');
if (!fs.existsSync(entregadasPath)) fs.writeFileSync(entregadasPath, '[]', 'utf-8');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Vistas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'login.html'));
});
app.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'main.html'));
});
app.get('/externos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'externos.html'));
});


// API CLIENTES
app.get('/api/clientes', (req, res) => {
  fs.readFile(clientesPath, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer los clientes' });
    res.json(JSON.parse(data || '[]'));
  });
});

app.post('/api/clientes', (req, res) => {
  const nuevo = req.body;
  fs.readFile(clientesPath, 'utf-8', (err, data) => {
    let arr = [];
    if (!err && data) {
      try { arr = JSON.parse(data); } catch { return res.status(500).json({ error: 'Error al parsear archivo' }); }
    }
    if (arr.find(c => c.codigo === nuevo.codigo)) {
      return res.status(400).json({ error: 'Código ya existente' });
    }
    arr.push(nuevo);
    fs.writeFile(clientesPath, JSON.stringify(arr, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Error al guardar cliente' });
      res.status(201).json({ mensaje: 'Cliente agregado' });
    });
  });
});

app.put('/api/clientes/:codigo', (req, res) => {
  const codigo = req.params.codigo;
  const actualizado = req.body;
  fs.readFile(clientesPath, 'utf-8', (err, data) => {
    let arr = JSON.parse(data || '[]');
    const idx = arr.findIndex(c => c.codigo === codigo);
    if (idx === -1) return res.status(404).json({ error: 'Cliente no encontrado' });
    arr[idx] = actualizado;
    fs.writeFile(clientesPath, JSON.stringify(arr, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Error al guardar cambios' });
      res.json({ mensaje: 'Cliente modificado' });
    });
  });
});

app.delete('/api/clientes/:codigo', (req, res) => {
  const codigo = req.params.codigo;
  fs.readFile(clientesPath, 'utf-8', (err, data) => {
    let arr = JSON.parse(data || '[]');
    const filtrado = arr.filter(c => c.codigo !== codigo);
    if (arr.length === filtrado.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    fs.writeFile(clientesPath, JSON.stringify(filtrado, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Error al eliminar' });
      res.json({ mensaje: 'Cliente eliminado' });
    });
  });
});

// API STOCK (reparaciones activas)
app.get('/api/stock', (req, res) => {
  fs.readFile(stockPath, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer stock' });
    res.json(JSON.parse(data || '[]'));
  });
});

app.post('/api/stock', (req, res) => {
  const nuevo = req.body;
  fs.readFile(stockPath, 'utf-8', (err, data) => {
    let arr = [];
    if (!err && data) {
      try { arr = JSON.parse(data); } catch { return res.status(500).json({ error: 'Error al parsear stock' }); }
    }
    arr.push(nuevo);
    fs.writeFile(stockPath, JSON.stringify(arr, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Error al guardar' });
      res.status(201).json({ mensaje: 'Reparación agregada' });
    });
  });
});

app.put('/api/stock/:codigo', (req, res) => {
  const codigo = req.params.codigo;
  const actualizado = req.body;
  fs.readFile(stockPath, 'utf-8', (err, data) => {
    let arr = JSON.parse(data || '[]');
    const idx = arr.findIndex(r => r.codigo === codigo);
    if (idx === -1) return res.status(404).json({ error: 'Reparación no encontrada' });
    arr[idx] = actualizado;
    fs.writeFile(stockPath, JSON.stringify(arr, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Error al modificar' });
      res.json({ mensaje: 'Reparación modificada' });
    });
  });
});

app.delete('/api/stock/:codigo', (req, res) => {
  const codigo = req.params.codigo;
  fs.readFile(stockPath, 'utf-8', (err, data) => {
    let arr = JSON.parse(data || '[]');
    const filtrado = arr.filter(r => r.codigo !== codigo);
    if (filtrado.length === arr.length) return res.status(404).json({ error: 'Reparación no encontrada' });
    fs.writeFile(stockPath, JSON.stringify(filtrado, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Error al eliminar' });
      res.json({ mensaje: 'Reparación eliminada' });
    });
  });
});

// API ENTREGADAS
app.get('/api/entregadas', (req, res) => {
  fs.readFile(entregadasPath, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer entregadas' });
    res.json(JSON.parse(data || '[]'));
  });
});

app.post('/api/entregadas', (req, res) => {
  const nueva = req.body;
  fs.readFile(entregadasPath, 'utf-8', (err, data) => {
    let arr = [];
    if (!err && data) {
      try { arr = JSON.parse(data); } catch { return res.status(500).json({ error: 'Error al parsear entregadas' }); }
    }
    arr.push(nueva);
    fs.writeFile(entregadasPath, JSON.stringify(arr, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Error al guardar entrega' });
      res.status(201).json({ mensaje: 'Reparación entregada registrada' });
    });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
