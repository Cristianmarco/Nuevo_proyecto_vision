// ======= [ABM CLIENTES SCRIPT CARGADO CON LOCAL STORAGE] =======

const STORAGE_KEY = "clientes_data";

// Cargar clientes desde localStorage o usar datos iniciales
let clientes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  { codigo: "C001", razonSocial: "Empresa A", fantasia: "Fantasia A", domicilio: "Calle 123", localidad: "Ciudad A", provincia: "Provincia A", telefono: "123456789", mail: "empresaA@mail.com", documento: "20-12345678-9" },
  { codigo: "C002", razonSocial: "Empresa B", fantasia: "Fantasia B", domicilio: "Avenida 456", localidad: "Ciudad B", provincia: "Provincia B", telefono: "987654321", mail: "empresaB@mail.com", documento: "27-87654321-0" }
];

document.addEventListener("DOMContentLoaded", () => {
  renderizarClientes();
});

function renderizarClientes() {
  const tbody = document.querySelector(".tabla-clientes tbody");
  tbody.innerHTML = "";

  clientes.forEach((cliente, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${cliente.codigo}</td>
      <td>${cliente.razonSocial}</td>
      <td>${cliente.fantasia}</td>
      <td>${cliente.domicilio}</td>
      <td>${cliente.localidad}</td>
      <td>${cliente.provincia}</td>
      <td>${cliente.telefono}</td>
      <td>${cliente.mail}</td>
      <td>${cliente.documento}</td>
    `;
    row.addEventListener("click", () => seleccionarFila(index));
    tbody.appendChild(row);
  });
}

function seleccionarFila(index) {
  const filas = document.querySelectorAll(".tabla-clientes tbody tr");
  filas.forEach(fila => fila.classList.remove("seleccionado"));
  filas[index].classList.add("seleccionado");
}

function visualizarCliente() {
  const seleccionado = obtenerClienteSeleccionado();
  if (!seleccionado) return;
  alert(`Visualizando cliente:\n\n${JSON.stringify(seleccionado, null, 2)}`);
}

function agregarCliente() {
  const nuevo = crearClientePorPrompt();
  if (nuevo) {
    clientes.push(nuevo);
    guardarDatos();
    renderizarClientes();
  }
}

function modificarCliente() {
  const index = obtenerIndiceSeleccionado();
  if (index === -1) return;

  const cliente = clientes[index];
  const actualizado = crearClientePorPrompt(cliente);
  if (actualizado) {
    clientes[index] = actualizado;
    guardarDatos();
    renderizarClientes();
  }
}

function eliminarCliente() {
  const index = obtenerIndiceSeleccionado();
  if (index === -1) return;

  if (confirm("¿Seguro que deseas eliminar este cliente?")) {
    clientes.splice(index, 1);
    guardarDatos();
    renderizarClientes();
  }
}

function crearClientePorPrompt(cliente = {}) {
  const nuevo = {
    codigo: prompt("Código:", cliente.codigo || ""),
    razonSocial: prompt("Razón Social:", cliente.razonSocial || ""),
    fantasia: prompt("Nombre de Fantasía:", cliente.fantasia || ""),
    domicilio: prompt("Domicilio:", cliente.domicilio || ""),
    localidad: prompt("Localidad:", cliente.localidad || ""),
    provincia: prompt("Provincia:", cliente.provincia || ""),
    telefono: prompt("Teléfono:", cliente.telefono || ""),
    mail: prompt("Mail:", cliente.mail || ""),
    documento: prompt("DNI/CUIT:", cliente.documento || "")
  };

  // Validar campos básicos (puedes agregar más validaciones)
  if (!nuevo.codigo || !nuevo.razonSocial) {
    alert("Código y Razón Social son campos obligatorios.");
    return null;
  }

  return nuevo;
}

function obtenerIndiceSeleccionado() {
  const filas = document.querySelectorAll(".tabla-clientes tbody tr");
  let index = -1;
  filas.forEach((fila, i) => {
    if (fila.classList.contains("seleccionado")) {
      index = i;
    }
  });

  if (index === -1) alert("Selecciona un cliente primero.");
  return index;
}

function obtenerClienteSeleccionado() {
  const index = obtenerIndiceSeleccionado();
  return index !== -1 ? clientes[index] : null;
}

function guardarDatos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
}

function abrirModal() {
  document.getElementById("modal-agregar").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modal-agregar").style.display = "none";
}

document.getElementById("form-agregar").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const nuevoCliente = {};
  formData.forEach((value, key) => {
    nuevoCliente[key] = value;
  });

  clientes.push(nuevoCliente);
  guardarDatos();
  renderizarClientes();
  cerrarModal();
  e.target.reset();
});

function abrirModalModificar() {
  const index = obtenerIndiceSeleccionado();
  if (index === -1) return;

  const cliente = clientes[index];
  const form = document.getElementById("form-modificar");
  Object.keys(cliente).forEach(key => {
    if (form.elements[key]) {
      form.elements[key].value = cliente[key];
    }
  });

  document.getElementById("modal-modificar").style.display = "flex";
}

function cerrarModalModificar() {
  document.getElementById("modal-modificar").style.display = "none";
}

document.getElementById("form-modificar").addEventListener("submit", function (e) {
  e.preventDefault();

  const index = obtenerIndiceSeleccionado();
  if (index === -1) return;

  const formData = new FormData(e.target);
  formData.forEach((value, key) => {
    clientes[index][key] = value;
  });

  guardarDatos();
  renderizarClientes();
  cerrarModalModificar();
});

function eliminarCliente() {
  const index = obtenerIndiceSeleccionado();
  if (index === -1) return;

  const cliente = clientes[index];
  if (confirm(`¿Seguro que deseas eliminar al cliente "${cliente.razonSocial}"?`)) {
    clientes.splice(index, 1);
    guardarDatos();
    renderizarClientes();
  }
}

function visualizarCliente() {
  const index = obtenerIndiceSeleccionado();
  if (index === -1) return;

  const cliente = clientes[index];
  const contenedor = document.getElementById("datos-cliente");
  
  // Vaciar antes de cargar
  contenedor.innerHTML = "";

  Object.entries(cliente).forEach(([key, value]) => {
    const p = document.createElement("p");
    p.textContent = `${formatearCampo(key)}: ${value}`;
    contenedor.appendChild(p);
  });

  document.getElementById("modal-visualizar").classList.add("mostrar");
}

function cerrarModalVisualizar() {
  document.getElementById("modal-visualizar").classList.remove("mostrar");
}

// Opcional: Mejorar visualización de nombres de campos
function formatearCampo(campo) {
  const nombres = {
    codigo: "Código",
    razonSocial: "Razón Social",
    fantasia: "Nombre de Fantasía",
    domicilio: "Domicilio",
    localidad: "Localidad",
    provincia: "Provincia",
    telefono: "Teléfono",
    mail: "Mail",
    documento: "DNI/CUIT"
  };
  return nombres[campo] || campo;
}
