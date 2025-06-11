const bcrypt = require('bcryptjs');

(async () => {
  const password = 'admin123'; // Cambialo si querés usar otra clave de prueba
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(`Hashed password para '${password}':\n`, hashedPassword);
})();
