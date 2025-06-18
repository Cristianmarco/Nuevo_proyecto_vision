// middleware/auth.js
function checkRole(requiredRole) {
  return (req, res, next) => {
    const user = req.headers['x-user']; // O req.session.user, según tu login
    const role = req.headers['x-role']; // O req.session.rol

    if (!user || !role) {
      return res.status(401).json({ error: "No autenticado" });
    }
    if (role !== requiredRole && role !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }
    // Opcional: puedes adjuntar datos al req para el controlador
    req.user = user;
    req.role = role;
    next();
  };
}

module.exports = { checkRole };
