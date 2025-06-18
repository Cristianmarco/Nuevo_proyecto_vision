// migrar-clientes-reparaciones.js
const fs = require('fs');
const path = require('path');

const clientesPath = path.join(__dirname, 'clientes.json');
const reparacionesPath = path.join(__dirname, 'reparaciones.json');

// Carga clientes: crea un diccionario nombre_fantasia/razonSocial → codigo
const clientesArr = JSON.parse(fs.readFileSync(clientesPath, 'utf-8'));
const mapaNombreACodigo = {};
clientesArr.forEach(c => {
  if (c.fantasia) mapaNombreACodigo[c.fantasia.trim().toLowerCase()] = c.codigo;
  if (c.razonSocial) mapaNombreACodigo[c.razonSocial.trim().toLowerCase()] = c.codigo;
});

// Carga reparaciones
const reparacionesArr = JSON.parse(fs.readFileSync(reparacionesPath, 'utf-8'));

// Backup por si acaso
fs.writeFileSync(reparacionesPath.replace('.json', '_backup.json'), JSON.stringify(reparacionesArr, null, 2));

// Cambia nombre por código en cada reparación
let sinMatch = 0;
reparacionesArr.forEach(rep => {
  if (rep.cliente) {
    const nombre = rep.cliente.trim().toLowerCase();
    const codigo = mapaNombreACodigo[nombre];
    if (codigo) {
      rep.cliente = codigo;
    } else {
      sinMatch++;
      // Si querés loguear los no encontrados:
      console.warn(`No se encontró código para cliente "${rep.cliente}" en reparación con código: ${rep.codigo}`);
    }
  }
});

// Guarda el archivo reparaciones.json migrado
fs.writeFileSync(reparacionesPath, JSON.stringify(reparacionesArr, null, 2));

console.log(`Migración completa. ${sinMatch > 0 ? sinMatch + ' reparaciones no coincidieron con ningún cliente.' : 'Todos los clientes migrados.'}`);
