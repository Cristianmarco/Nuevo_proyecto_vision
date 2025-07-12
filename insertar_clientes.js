// insertar_clientes.js
const db = require('./db');

async function insertarCliente() {
  const cliente = {
    codigo: 'C001',
    razon_social: 'Cofaypro S.R.L.',
    fantasia: 'Cofaypro',
    domicilio: 'José León Suárez 1538',
    localidad: 'Mataderos',
    provincia: 'CABA',
    telefono: '1146864784',
    mail: '',
    documento: '30-71203432-3'
  };

  const res = await db.query(
    `INSERT INTO clientes
      (codigo, razon_social, fantasia, domicilio, localidad, provincia, telefono, mail, documento)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [
      cliente.codigo,
      cliente.razon_social,
      cliente.fantasia,
      cliente.domicilio,
      cliente.localidad,
      cliente.provincia,
      cliente.telefono,
      cliente.mail,
      cliente.documento
    ]
  );

  console.log("Cliente insertado:", res.rows[0]);
  process.exit();
}

insertarCliente();
