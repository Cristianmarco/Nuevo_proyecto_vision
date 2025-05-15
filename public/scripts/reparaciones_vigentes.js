// ======= [REPARACIONES VIGENTES - COMPLETO Y CORREGIDO] =======

let reparaciones = [];

// Cargar reparaciones al iniciar
document.addEventListener("DOMContentLoaded", () => {
    cargarReparaciones();
});

// Cargar desde API
async function cargarReparaciones() {
    try {
        const response = await fetch('/api/reparaciones');
        reparaciones = await response.json();
        renderizarTabla();
    } catch (error) {
        console.error("Error al cargar reparaciones:", error);
    }
}

// Renderizar Tabla de Reparaciones Vigentes
function renderizarTabla() {
    const tbody = document.getElementById("reparaciones-tbody");
    tbody.innerHTML = "";

    reparaciones.forEach((rep, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${rep.fechaIngreso}</td>
            <td>${rep.codigo}</td>
            <td>${rep.tipo}</td>
            <td>${rep.modelo}</td>
            <td>${rep.cliente}</td>
            <td>${rep.tecnico}</td>
            <td>${rep.id}</td>
            <td>${rep.estado}</td>
            <td><button onclick="marcarTerminado('${rep.codigo}')" class="btn-terminado">Terminado</button></td>
        `;
        row.addEventListener("click", () => seleccionarFila(index));
        tbody.appendChild(row);
    });
}

// Cargar y Renderizar Entregadas
async function marcarTerminado(codigo) {
    const rep = reparaciones.find(r => r.codigo === codigo);
    if (!rep) return;

    if (confirm("¿Marcar esta reparación como terminada?")) {
        try {
            rep.fechaEntrega = new Date().toISOString().split('T')[0];

            // Primero guardamos en entregadas
            const entregaResp = await fetch('/api/entregadas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rep)
            });

            if (!entregaResp.ok) throw new Error("Error al guardar en entregadas");

            // Luego eliminamos de vigentes
            const deleteResp = await fetch(`/api/reparaciones/${codigo}`, {
                method: 'DELETE'
            });

            if (!deleteResp.ok) throw new Error("Error al eliminar de vigentes");

            await cargarReparaciones();

        } catch (error) {
            console.error("Error en el proceso de finalización:", error);
            alert("Ocurrió un error al finalizar la reparación.");
        }
    }
}

// Gestión de Fila Seleccionada
function seleccionarFila(index) {
    const filas = document.querySelectorAll("#reparaciones-tbody tr");
    filas.forEach(fila => fila.classList.remove("seleccionado"));
    filas[index].classList.add("seleccionado");
}

function obtenerIndiceSeleccionado() {
    const filas = document.querySelectorAll("#reparaciones-tbody tr");
    let index = -1;
    filas.forEach((fila, i) => {
        if (fila.classList.contains("seleccionado")) {
            index = i;
        }
    });
    if (index === -1) alert("Selecciona una reparación primero.");
    return index;
}

// Modales Agregar / Modificar
function abrirModalAgregar() {
    document.getElementById("modal-agregar").style.display = "flex";
}

function cerrarModalAgregar() {
    document.getElementById("modal-agregar").style.display = "none";
}

function abrirModalModificar() {
    const index = obtenerIndiceSeleccionado();
    if (index === -1) return;

    const rep = reparaciones[index];
    const form = document.getElementById("form-modificar");

    Object.keys(rep).forEach(key => {
        if (form.elements[key]) {
            form.elements[key].value = rep[key];
        }
    });

    document.getElementById("modal-modificar").style.display = "flex";
}

function cerrarModalModificar() {
    document.getElementById("modal-modificar").style.display = "none";
}

// Eventos Formularios
document.getElementById("form-agregar").addEventListener("submit", function (e) {
    e.preventDefault();
    agregarReparacion();
});

document.getElementById("form-modificar").addEventListener("submit", function (e) {
    e.preventDefault();
    modificarReparacion();
});

// Agregar Reparación
async function agregarReparacion() {
    const form = document.getElementById("form-agregar");
    const formData = new FormData(form);
    const nueva = {};
    formData.forEach((value, key) => nueva[key] = value);

    if (!nueva.codigo) {
        alert("El campo Código es obligatorio.");
        return;
    }

    try {
        const response = await fetch('/api/reparaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nueva)
        });

        if (response.ok) {
            await cargarReparaciones();
            cerrarModalAgregar();
            form.reset();
        } else {
            alert("Error al guardar reparación.");
        }
    } catch (error) {
        console.error("Error al agregar reparación:", error);
    }
}

// Modificar Reparación
async function modificarReparacion() {
    const index = obtenerIndiceSeleccionado();
    if (index === -1) return;

    const rep = reparaciones[index];
    const form = document.getElementById("form-modificar");
    const formData = new FormData(form);
    const actualizado = {};

    formData.forEach((value, key) => actualizado[key] = value);

    try {
        const response = await fetch(`/api/reparaciones/${rep.codigo}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(actualizado)
        });

        if (response.ok) {
            await cargarReparaciones();
            cerrarModalModificar();
        } else {
            alert("Error al modificar reparación.");
        }
    } catch (error) {
        console.error("Error al modificar reparación:", error);
    }
}
