let reparaciones = [];

// Al iniciar, cargar las reparaciones
document.addEventListener("DOMContentLoaded", () => {
    cargarReparaciones();
});

async function cargarReparaciones() {
    try {
        const response = await fetch('/api/reparaciones');
        reparaciones = await response.json();
        renderizarTabla();
    } catch (error) {
        console.error("Error al cargar reparaciones:", error);
    }
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return "-";
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}


function renderizarTabla() {
  const tbody = document.getElementById("reparaciones-tbody");
  tbody.innerHTML = "";

  reparaciones.forEach((rep, index) => {
    const fechaIngreso = new Date(rep.fechaIngreso);
    const hoy = new Date();
    const diffDias = Math.floor((hoy - fechaIngreso) / (1000 * 60 * 60 * 24));
    const alertaClase = diffDias > 21 ? 'alerta-fecha' : '';
    const colorClase = obtenerColorEstado(rep.estado);

    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="${alertaClase}">${formatearFecha(rep.fechaIngreso)}</td>
      <td>${rep.codigo}</td>
      <td>${rep.tipo}</td>
      <td>${rep.modelo}</td>
      <td>${rep.cliente}</td>
      <td>${rep.id}</td>
      <td>
        <select class="estado-select" onchange="cambiarEstado('${rep.codigo}', this.value)">
          <option value="Ingreso" ${rep.estado === 'Ingreso' ? 'selected' : ''}>Ingreso</option>
          <option value="Esperando confirmacion" ${rep.estado === 'Esperando confirmacion' ? 'selected' : ''}>Esperando Confirmación</option>
          <option value="Esperando repuesto" ${rep.estado === 'Esperando repuesto' ? 'selected' : ''}>Esperando Repuesto</option>
          <option value="Salida" ${rep.estado === 'Salida' ? 'selected' : ''}>Salida</option>
        </select>
      </td>
      <td><span class="semaforo ${colorClase}"></span></td>
      <td>
        <button class="btn-terminado" onclick="marcarTerminado('${rep.codigo}')">Terminado</button>
      </td>
    `;

    row.addEventListener("click", () => seleccionarFila(index));
    row.addEventListener("dblclick", () => visualizarReparacion());

    tbody.appendChild(row);
  });
}

function obtenerColorEstado(estado) {
  switch (estado) {
    case 'Ingreso': return 'verde';
    case 'Esperando confirmacion': return 'naranja';
    case 'Esperando repuesto': return 'amarillo';
    case 'Salida': return 'rojo';
    default: return '';
  }
}

async function cambiarEstado(codigo, nuevoEstado) {
    const rep = reparaciones.find(r => r.codigo === codigo);
    if (!rep) return;

    rep.estado = nuevoEstado;

    try {
        const response = await fetch(`/api/reparaciones/${codigo}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rep)
        });

        if (!response.ok) throw new Error("Error al actualizar estado");
        await cargarReparaciones();
    } catch (error) {
        console.error("Error al cambiar estado:", error);
    }
}

async function marcarTerminado(codigo) {
    const rep = reparaciones.find(r => r.codigo === codigo);
    if (!rep) return;

    if (confirm("¿Marcar esta reparación como terminada?")) {
        try {
            rep.fechaEntrega = new Date().toISOString().split('T')[0];
            const save = await fetch('/api/entregadas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rep)
            });
            if (!save.ok) throw new Error("Error al guardar en entregadas");

            const del = await fetch(`/api/reparaciones/${codigo}`, { method: 'DELETE' });
            if (!del.ok) throw new Error("Error al eliminar de vigentes");

            await cargarReparaciones();
        } catch (error) {
            console.error("Error al finalizar reparación:", error);
            alert("Ocurrió un error al finalizar.");
        }
    }
}

// ========== Fila Seleccionada ==========
function seleccionarFila(index) {
    const filas = document.querySelectorAll("#reparaciones-tbody tr");
    filas.forEach(f => f.classList.remove("seleccionado"));
    filas[index].classList.add("seleccionado");
}

function obtenerIndiceSeleccionado() {
    const filas = document.querySelectorAll("#reparaciones-tbody tr");
    let index = -1;
    filas.forEach((f, i) => {
        if (f.classList.contains("seleccionado")) index = i;
    });
    if (index === -1) alert("Selecciona una reparación primero.");
    return index;
}

// ========== MODALES ==========
function abrirModalAgregar() {
    document.getElementById("modal-agregar").style.display = "flex";
}
function cerrarModalAgregar() {
    document.getElementById("modal-agregar").style.display = "none";
}
function abrirModalModificar() {
    const i = obtenerIndiceSeleccionado();
    if (i === -1) return;
    const rep = reparaciones[i];
    const form = document.getElementById("form-modificar");
    Object.keys(rep).forEach(k => { if (form.elements[k]) form.elements[k].value = rep[k]; });
    document.getElementById("modal-modificar").style.display = "flex";
}
function cerrarModalModificar() {
    document.getElementById("modal-modificar").style.display = "none";
}

document.getElementById("form-agregar").addEventListener("submit", e => {
    e.preventDefault(); agregarReparacion();
});
document.getElementById("form-modificar").addEventListener("submit", e => {
    e.preventDefault(); modificarReparacion();
});

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

async function modificarReparacion() {
    const i = obtenerIndiceSeleccionado();
    if (i === -1) return;

    const rep = reparaciones[i];
    const form = document.getElementById("form-modificar");
    const formData = new FormData(form);
    const actualizado = {};
    formData.forEach((v, k) => actualizado[k] = v);

    try {
        const res = await fetch(`/api/reparaciones/${rep.codigo}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(actualizado)
        });
        if (res.ok) {
            await cargarReparaciones();
            cerrarModalModificar();
        } else alert("Error al modificar reparación.");
    } catch (err) {
        console.error("Error al modificar:", err);
    }
}

async function eliminarReparacion() {
    const index = obtenerIndiceSeleccionado();
    if (index === -1) return;

    const rep = reparaciones[index];
    if (!rep) return;

    if (confirm(`¿Seguro que deseas eliminar la reparación de ${rep.cliente}?`)) {
        try {
            const response = await fetch(`/api/reparaciones/${rep.codigo}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error("Error al eliminar la reparación.");

            await cargarReparaciones();
            alert("Reparación eliminada con éxito.");
        } catch (error) {
            console.error("Error al eliminar reparación:", error);
            alert("Error al eliminar reparación.");
        }
    }
}


function visualizarReparacion() {
    const index = obtenerIndiceSeleccionado();
    if (index === -1) return;
    const rep = reparaciones[index];

    // Mostrar ID en el título
    document.getElementById("historial-titulo").innerText = `Historial de Reparación - ID: ${rep.id}`;

    // Encabezado sin el Estado
    const datos = `
        <p><strong>Código:</strong> ${rep.codigo}</p>
        <p><strong>Tipo:</strong> ${rep.tipo}</p>
        <p><strong>Modelo:</strong> ${rep.modelo}</p>
        <p><strong>Cliente:</strong> ${rep.cliente}</p>
    `;
    document.getElementById("datos-equipo").innerHTML = datos;
    document.getElementById("campo-historial").value = rep.historial || "Sin historial disponible.";
    document.getElementById("modal-historial").style.display = "flex";
}

function cerrarModalHistorial() {
    document.getElementById("modal-historial").style.display = "none";
}

let codigoActual = null;

function abrirModalAgregarHistorial() {
    document.getElementById("modal-agregar-historial").style.display = "flex";
}

function cerrarModalAgregarHistorial() {
    document.getElementById("modal-agregar-historial").style.display = "none";
    // Limpiar los campos del formulario
    document.getElementById("fecha-reparacion").value = '';
    document.getElementById("cambios-reparacion").value = '';
    document.getElementById("observaciones-reparacion").value = '';
}

function visualizarReparacion() {
    const index = obtenerIndiceSeleccionado();
    if (index === -1) return;

    const rep = reparaciones[index];
    codigoActual = rep.codigo;

    const datos = `
        <p><strong>ID:</strong> ${rep.id}</p>
        <p><strong>Código:</strong> ${rep.codigo}</p>
        <p><strong>Tipo:</strong> ${rep.tipo}</p>
        <p><strong>Modelo:</strong> ${rep.modelo}</p>
        <p><strong>Cliente:</strong> ${rep.cliente}</p>
    `;

    document.getElementById("datos-equipo").innerHTML = datos;
    document.getElementById("campo-historial").value = rep.historial || "Sin historial disponible.";
    document.getElementById("modal-historial").style.display = "flex";
}

function cerrarModalHistorial() {
    document.getElementById("modal-historial").style.display = "none";
}

async function guardarHistorial() {
    const fecha = document.getElementById("fecha-reparacion").value;
    const cambios = document.getElementById("cambios-reparacion").value.trim();
    const observaciones = document.getElementById("observaciones-reparacion").value.trim();

    if (!fecha || !cambios || !observaciones) {
        alert("Debes completar todos los campos.");
        return;
    }

    const nuevoRegistro = `[${fecha}] Cambios: ${cambios}. Observaciones: ${observaciones}`;

    const idx = reparaciones.findIndex(r => r.codigo === codigoActual);
    if (idx !== -1) {
        reparaciones[idx].historial = (reparaciones[idx].historial || "") + `\n${nuevoRegistro}`;

        // Guardar en JSON a través de la API
        try {
            const response = await fetch(`/api/reparaciones/${codigoActual}/historial`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ historial: reparaciones[idx].historial })
            });

            if (!response.ok) throw new Error("Error al guardar en backend");

            document.getElementById("campo-historial").value = reparaciones[idx].historial;
            cerrarModalAgregarHistorial();
        } catch (error) {
            console.error("Error al guardar historial en JSON:", error);
        }
    }
}

async function buscarGlobal() {
    const consulta = document.getElementById("busqueda-global").value.toLowerCase();

    // Buscar en vigentes
    const resVigentes = await fetch('/api/reparaciones');
    const vigentes = await resVigentes.json();

    // Buscar en entregadas
    const resEntregadas = await fetch('/api/entregadas');
    const entregadas = await resEntregadas.json();

    const resultadosVigentes = vigentes.filter(rep =>
        Object.values(rep).some(val => String(val).toLowerCase().includes(consulta))
    );

    const resultadosEntregadas = entregadas.filter(rep =>
        Object.values(rep).some(val => String(val).toLowerCase().includes(consulta))
    );

    renderizarBusqueda("reparaciones-tbody", resultadosVigentes);
    renderizarBusqueda("entregadas-tbody", resultadosEntregadas);
}

function renderizarBusqueda(tbodyId, resultados) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    tbody.innerHTML = "";
    resultados.forEach(rep => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${formatearFecha(rep.fechaIngreso)}</td>
            <td>${rep.codigo}</td>
            <td>${rep.tipo}</td>
            <td>${rep.modelo}</td>
            <td>${rep.cliente}</td>
            <td>${rep.id}</td>
            <td>${rep.estado}</td>
        `;
        tbody.appendChild(row);
    });
}

// Mostrar menú en la posición del cursor

function abrirMenuContextual(event, codigo) {
    event.stopPropagation();

    // Cerrar otros menús abiertos
    document.querySelectorAll(".menu-contextual").forEach(m => m.classList.add("oculto"));

    const spanClicked = event.target;
    const menu = spanClicked.closest('.estado-contenedor').querySelector('.menu-contextual');

    if (menu) {
        menu.classList.toggle("oculto");

        const cerrar = function (e) {
            if (!menu.contains(e.target) && e.target !== spanClicked) {
                menu.classList.add("oculto");
                document.removeEventListener("click", cerrar);
            }
        };
        document.addEventListener("click", cerrar);
    }
}












