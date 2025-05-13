const STORAGE_KEY = "clientes_data";

// Cargar clientes desde localStorage o usar datos de prueba
let clientes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  { codigo: "C001", razonSocial: "Empresa A", fantasia: "Fantasia A", domicilio: "Calle 123", localidad: "Ciudad A", provincia: "Provincia A", telefono: "123456789", mail: "empresaA@mail.com", documento: "20-12345678-9" },
  { codigo: "C002", razonSocial: "Empresa B", fantasia: "Fantasia B", domicilio: "Avenida 456", localidad: "Ciudad B", provincia: "Provincia B", telefono: "987654321", mail: "empresaB@mail.com", documento: "27-87654321-0" }
];

// ==============================
// FUNCIONES DE CLIENTES
// ==============================

// Cargar Clientes al iniciar la página
document.addEventListener('DOMContentLoaded', cargarClientes);

// Cargar datos de localStorage y mostrarlos en la tabla
function cargarClientes() {
    const tbody = document.getElementById('clientes-tbody');
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');

    tbody.innerHTML = ''; // Limpiar tabla

    clientes.forEach(cliente => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
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
        fila.onclick = () => seleccionarFila(fila, cliente);
        tbody.appendChild(fila);
    });
}

let clienteSeleccionado = null;

function seleccionarFila(fila, cliente) {
    // Quitar selección previa
    document.querySelectorAll('tr').forEach(row => row.classList.remove('seleccionado'));
    fila.classList.add('seleccionado');
    clienteSeleccionado = cliente;
}

// ==============================
// FUNCIONES MODALES
// ==============================

function abrirModalAgregar() {
    document.getElementById('modal-agregar').style.display = 'flex';
}

function cerrarModalAgregar() {
    document.getElementById('modal-agregar').style.display = 'none';
}

function abrirModalModificar() {
    if (!clienteSeleccionado) return alert('Seleccione un cliente primero.');

    const form = document.getElementById('form-modificar');
    Object.keys(clienteSeleccionado).forEach(key => {
        if (form.elements[key]) {
            form.elements[key].value = clienteSeleccionado[key];
        }
    });

    document.getElementById('modal-modificar').style.display = 'flex';
}

function cerrarModalModificar() {
    document.getElementById('modal-modificar').style.display = 'none';
}

function visualizarCliente() {
    if (!clienteSeleccionado) return alert('Seleccione un cliente primero.');
    alert(`Datos del Cliente:\n\nCódigo: ${clienteSeleccionado.codigo}\nRazón Social: ${clienteSeleccionado.razonSocial}\nNombre Fantasía: ${clienteSeleccionado.fantasia}\nDomicilio: ${clienteSeleccionado.domicilio}\nLocalidad: ${clienteSeleccionado.localidad}\nProvincia: ${clienteSeleccionado.provincia}\nTeléfono: ${clienteSeleccionado.telefono}\nMail: ${clienteSeleccionado.mail}\nDNI/CUIT: ${clienteSeleccionado.documento}`);
}

// ==============================
// CRUD CLIENTES
// ==============================

document.getElementById('form-agregar').addEventListener('submit', e => {
    e.preventDefault();

    const form = e.target;
    const nuevoCliente = Object.fromEntries(new FormData(form).entries());

    let clientes = JSON.parse(localStorage.getItem('clientes') || '[]');

    if (clientes.find(c => c.codigo === nuevoCliente.codigo)) {
        return alert('El código de cliente ya existe.');
    }

    clientes.push(nuevoCliente);
    localStorage.setItem('clientes', JSON.stringify(clientes));
    cerrarModalAgregar();
    cargarClientes();
    form.reset();
});

document.getElementById('form-modificar').addEventListener('submit', e => {
    e.preventDefault();

    const form = e.target;
    const datosActualizados = Object.fromEntries(new FormData(form).entries());

    let clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    const idx = clientes.findIndex(c => c.codigo === datosActualizados.codigo);

    if (idx !== -1) {
        clientes[idx] = datosActualizados;
        localStorage.setItem('clientes', JSON.stringify(clientes));
    }

    cerrarModalModificar();
    cargarClientes();
    form.reset();
});

function eliminarCliente() {
    if (!clienteSeleccionado) return alert('Seleccione un cliente para eliminar.');

    if (confirm(`¿Está seguro de eliminar al cliente con código ${clienteSeleccionado.codigo}?`)) {
        let clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
        clientes = clientes.filter(c => c.codigo !== clienteSeleccionado.codigo);
        localStorage.setItem('clientes', JSON.stringify(clientes));
        cargarClientes();
        clienteSeleccionado = null;
    }
}

function visualizarCliente() {
    const seleccionado = obtenerClienteSeleccionado();
    if (!seleccionado) return alert('Selecciona un cliente primero.');

    const contenedor = document.getElementById("datos-cliente");
    contenedor.innerHTML = ""; // Limpiar antes de cargar

    Object.entries(seleccionado).forEach(([key, value]) => {
        const p = document.createElement("p");
        p.textContent = `${formatearCampo(key)}: ${value}`;
        contenedor.appendChild(p);
    });

    document.getElementById("modal-visualizar").classList.add("mostrar");
}

function cerrarModalVisualizar() {
    document.getElementById("modal-visualizar").classList.remove("mostrar");
}

function obtenerClienteSeleccionado() {
    const filas = document.querySelectorAll(".tabla-clientes tbody tr");
    let index = -1;

    filas.forEach((fila, i) => {
        if (fila.classList.contains("seleccionado")) {
            index = i;
        }
    });

    if (index === -1) {
        alert("Selecciona un cliente primero.");
        return null;
    }

    return clientes[index];
}

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




