const express = require('express');
const app = express();
const path = require('path');
const loginRouter = require('./routes/login');
const vistasRouter = require('./routes/vistas');
const clientesRouter = require('./routes/clientes');
const reparacionesRouter = require('./routes/reparaciones');
const entregadasRouter = require('./routes/historial');
const session = require('express-session');
const usuariosRouter = require('./routes/usuarios');
const historialRouter = require('./routes/historial');

app.use(session({
  secret: 'secretoSuperSeguro', // 🔐 ¡cambiá esto por algo fuerte en producción!
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true si usás HTTPS
}));



// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Usar rutas
app.use('/api/login', loginRouter);
app.use('/api/clientes', clientesRouter);
app.use('/', vistasRouter);
app.use('/api/reparaciones', reparacionesRouter);
app.use('/api/entregadas', entregadasRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/historial', historialRouter);

// Error Handler Middleware (opcional)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});