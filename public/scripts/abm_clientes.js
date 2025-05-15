// ======= [ABM CLIENTES CON API - PERSISTENCIA EN clientes.json] =======

// Cargar Clientes al iniciar la página
document.addEventListener('DOMContentLoaded', cargarClientes);

async function cargarClientes() {
    try {
        const response = await fetch('/api/clientes');
        const clientes = await response.json();
        renderizarClientes(clientes);
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
}

function renderizarClientes(clientes) {
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

function obtenerClienteSeleccionado() {
    const filas = document.querySelectorAll(".tabla-clientes tbody tr");
    let index = -1;
    filas.forEach((fila, i) => {
        if (fila.classList.contains("seleccionado")) index = i;
    });
    if (index === -1) {
        alert("Selecciona un cliente primero.");
        return null;
    }
    const row = filas[index].querySelectorAll("td");
    return {
        codigo: row[0].innerText,
        razonSocial: row[1].innerText,
        fantasia: row[2].innerText,
        domicilio: row[3].innerText,
        localidad: row[4].innerText,
        provincia: row[5].innerText,
        telefono: row[6].innerText,
        mail: row[7].innerText,
        documento: row[8].innerText,
    };
}

async function agregarCliente() {
    const form = document.getElementById("form-agregar");
    const formData = new FormData(form);
    const nuevoCliente = {};
    formData.forEach((value, key) => nuevoCliente[key] = value);

    try {
        const response = await fetch('/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoCliente),
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.error || 'Error al agregar cliente.');
            return;
        }

        cerrarModalAgregar();
        cargarClientes();
        form.reset();
    } catch (error) {
        console.error('Error al agregar cliente:', error);
    }
}

async function modificarCliente() {
    const cliente = obtenerClienteSeleccionado();
    if (!cliente) return;

    const form = document.getElementById("form-modificar");
    const formData = new FormData(form);
    const datosActualizados = {};
    formData.forEach((value, key) => datosActualizados[key] = value);

    try {
        const response = await fetch(`/api/clientes/${cliente.codigo}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados),
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.error || 'Error al modificar cliente.');
            return;
        }

        cerrarModalModificar();
        cargarClientes();
    } catch (error) {
        console.error('Error al modificar cliente:', error);
    }
}

async function eliminarCliente() {
    const cliente = obtenerClienteSeleccionado();
    if (!cliente) return;

    if (!confirm(`¿Seguro que deseas eliminar al cliente "${cliente.razonSocial}"?`)) return;

    try {
        const response = await fetch(`/api/clientes/${cliente.codigo}`, { method: 'DELETE' });

        if (!response.ok) {
            const error = await response.json();
            alert(error.error || 'Error al eliminar cliente.');
            return;
        }

        cargarClientes();
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
    }
}

// Modales
function abrirModalAgregar() {
    document.getElementById("modal-agregar").style.display = "flex";
}

function cerrarModalAgregar() {
    document.getElementById("modal-agregar").style.display = "none";
}

function abrirModalModificar() {
    const cliente = obtenerClienteSeleccionado();
    if (!cliente) return;

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

function visualizarCliente() {
    const cliente = obtenerClienteSeleccionado();
    if (!cliente) return;

    const contenedor = document.getElementById("datos-cliente");
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

document.getElementById("form-agregar").addEventListener("submit", function (e) {
    e.preventDefault(); // Evita que recargue la página
    agregarCliente();
});

document.getElementById("form-modificar").addEventListener("submit", function (e) {
    e.preventDefault();
    modificarCliente();
});
