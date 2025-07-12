const db = require('./db');

async function listarClientes() {
  const res = await db.query('SELECT * FROM clientes');
  console.log("Clientes:", res.rows);
  process.exit();
}

listarClientes();

