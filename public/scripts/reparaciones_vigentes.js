let reparaciones = [];

let codigoActual = null;

let resultadosBusqueda = []; // nueva global

let codigoOriginal = ""; 



document.addEventListener("DOMContentLoaded", () => {
    const rol = localStorage.getItem('rol');
    const usuario = localStorage.getItem('username');
    if (rol === 'CLIENTE' && usuario) {
        cargarReparaciones(usuario);
    } else {
        cargarReparaciones();
    }
});

async function cargarReparaciones(cliente = '') {
    try {
        let url = '/api/reparaciones';
        if (cliente) {
            url += `?cliente=${encodeURIComponent(cliente)}`;
        }
        const response = await fetch(url);
        reparaciones = await response.json();
        renderizarTabla();
    } catch (error) {
        console.error("Error al cargar reparaciones:", error);
    }
}


function formatearFecha(fechaISO) {
    if (!fechaISO) return "-";
    const [anio, mes, dia] = fechaISO.split('-');
    const fecha = new Date(anio, mes - 1, dia);  // Evita problemas de zona horaria
    const diaFormateado = String(fecha.getDate()).padStart(2, '0');
    const mesFormateado = String(fecha.getMonth() + 1).padStart(2, '0');
    return `${diaFormateado}/${mesFormateado}/${anio}`;
}

function renderizarTabla(lista = reparaciones) {
    const tbody = document.getElementById("reparaciones-tbody");
    tbody.innerHTML = "";

    lista.forEach(rep => {
        const realIndex = reparaciones.findIndex(r => r.codigo === rep.codigo);

        const row = document.createElement("tr");
        row.setAttribute("data-index", realIndex);

        row.innerHTML = `
            <td>${formatearFecha(rep.fechaIngreso)}</td>
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
            <td><span class="semaforo ${obtenerColorEstado(rep.estado)}"></span></td>
            <td><button class="btn-terminado" onclick="marcarTerminado('${rep.codigo}')">Terminado</button></td>
            <td style="text-align: center;">${rep.garantia ? '✔️' : ''}</td>
        `;

        row.addEventListener("click", function () {
            tbody.querySelectorAll("tr").forEach(f => f.classList.remove("seleccionado"));
            this.classList.add("seleccionado");
            codigoActual = rep.codigo;
            console.log("Seleccionaste:", codigoActual);
        });

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
            
            const hoy = new Date();
            rep.fechaEntrega = hoy.toLocaleDateString('es-AR').split('/').reverse().join('-');

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
    // Actualiza codigoActual correctamente
    if (reparaciones[index]) {
        codigoActual = reparaciones[index].codigo;
    }
}

function obtenerIndiceSeleccionado() {
    const fila = document.querySelector("#reparaciones-tbody tr.seleccionado");
    if (!fila) return -1;

    const codigoSeleccionado = fila.children[1].textContent.trim();

    // Buscamos el índice real en reparaciones (aunque se haya mostrado desde una búsqueda)
    return reparaciones.findIndex(r => r.codigo === codigoSeleccionado);
}


// ========== Modal Agregar ==========
function abrirModalAgregar() {
    const modal = document.getElementById("modal-agregar");
    if (modal) modal.style.display = "flex";
}
function cerrarModalAgregar() {
    const modal = document.getElementById("modal-agregar");
    if (modal) modal.style.display = "none";
}

// ========== Modal Modificar ==========
function abrirModalModificar() {
    let index = obtenerIndiceSeleccionado();

    // Si no hay selección visible, intentamos buscar por el último codigoActual
    if (index === -1 && codigoActual) {
        index = reparaciones.findIndex(r => r.codigo === codigoActual);
    }

    if (index === -1) {
        alert("Selecciona una reparación primero.");
        return;
    }

    // Marca visualmente la fila en la tabla filtrada
    seleccionarFila(index);

    const rep = reparaciones[index];
    const form = document.getElementById("form-modificar");

    Object.keys(rep).forEach(k => {
        if (form.elements[k]) {
            if (form.elements[k].type === "checkbox") {
                form.elements[k].checked = rep[k];
            } else {
                form.elements[k].value = rep[k];
            }
        }
    });

    codigoOriginal = rep.codigo;
    codigoActual = rep.codigo;

    // Mostrar el modal
    document.getElementById("modal-modificar").style.display = "flex";
}

// ========== Modal Visualizar ==========
function visualizarReparacion() {
    const index = obtenerIndiceSeleccionado();
    if (index === -1) return;

    const rep = reparaciones[index];
    codigoActual = rep.codigo;

    // Título y datos principales del equipo
    document.getElementById("historial-titulo").textContent = `ID: ${rep.id}`;
    document.getElementById("datos-equipo").innerHTML = `
        <p><strong>Código:</strong> ${rep.codigo}</p>
        <p><strong>Tipo:</strong> ${rep.tipo}</p>
        <p><strong>Modelo:</strong> ${rep.modelo}</p>
        <p><strong>Cliente:</strong> ${rep.cliente}</p>
    `;

    // Asegurar que el historial sea un array
    let historial = [];

    if (Array.isArray(rep.historial)) {
        historial = rep.historial;
    } else if (typeof rep.historial === "string" && rep.historial.trim() !== "") {
        // Convertir string plano en un solo objeto como fallback
        historial = [{
            fecha: '',
            tecnico: '',
            garantia: rep.garantia || false,
            observaciones: rep.historial,
            repuestos: ''
        }];
    }

    // Renderizar cada entrada del historial como bloque HTML
    const contenedor = document.getElementById("campo-historial");
    contenedor.innerHTML = historial.map(evento => `
        <div class="historial-registro">
            <table>
                <tr>
                    <td><strong>Fecha:</strong> ${formatearFecha(evento.fecha)}</td>
                    <td><strong>Técnico:</strong> ${evento.tecnico}</td>
                    <td><strong>Garantía:</strong> ${evento.garantia ? 'Sí' : 'No'}</td>
                </tr>
                <tr>
                    <td colspan="3"><strong>Observaciones:</strong> ${evento.observaciones}</td>
                </tr>
                <tr>
                    <td colspan="3"><strong>Repuestos:</strong> ${evento.repuestos}</td>
                </tr>
            </table>
        </div>
    `).join('');

    // Mostrar modal
    document.getElementById("modal-historial").style.display = "flex";
}


function cerrarModalHistorial() {
    document.getElementById("modal-historial").style.display = "none";
}

// ========== Modal Agregar Historial ==========
function abrirModalAgregarHistorial() {
    if (!codigoActual) {
        alert("Selecciona una reparación primero.");
        return;
    }
    document.getElementById("modal-agregar-historial").style.display = "flex";
}


function cerrarModalAgregarHistorial() {
    const modal = document.getElementById("modal-agregar-historial");
    if (modal) modal.style.display = "none";

    // Limpiar todos los campos
    const campos = [
        "fecha-reparacion",
        "cambios-reparacion",
        "observaciones-reparacion",
        "tecnico-reparacion"
    ];
    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.value = '';
    });
}

// ========== Agregar Reparación ==========
document.getElementById("form-agregar").addEventListener("submit", e => {
    e.preventDefault();
    agregarReparacion();
});

async function agregarReparacion() {
    const form = document.getElementById("form-agregar");
    const formData = new FormData(form);
    const nueva = {};
    formData.forEach((value, key) => nueva[key] = value);

    nueva.garantia = form.elements["garantia"].checked;

    // ✅ No transformamos fechaIngreso porque ya está en formato yyyy-mm-dd
    // Solo validamos que esté presente
    if (!nueva.fechaIngreso) {
        alert("El campo Fecha de Ingreso es obligatorio.");
        return;
    }

    if (!nueva.codigo) {
        alert("El campo Código es obligatorio.");
        return;
    }

    const idExiste = reparaciones.some(r => r.id === nueva.id);
    if (idExiste) {
        alert("El ID ya está en uso. Por favor ingresa uno distinto.");
        return;
    }

    console.log("🚨 Datos que se envían al servidor:", nueva);

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


// ========== Modificar Reparación ==========
document.getElementById("form-modificar").addEventListener("submit", e => {
    e.preventDefault();
    modificarReparacion();
});

async function modificarReparacion() {
    const form = document.getElementById("form-modificar");
    const formData = new FormData(form);
    const actualizado = {};
    formData.forEach((v, k) => actualizado[k] = v);
    actualizado.garantia = form.elements["garantia"].checked;

    // Usamos el código del formulario directamente
    const codigo = form.elements["codigo"].value;

    if (!codigo) {
        alert("Código inválido. No se puede modificar.");
        return;
    }

    try {
        const res = await fetch(`/api/reparaciones/${codigoOriginal}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(actualizado)
        });

        if (res.ok) {
            await cargarReparaciones();
            cerrarModalModificar();
        } else {
            alert("Error al modificar reparación.");
        }
    } catch (err) {
        console.error("Error al modificar:", err);
        alert("Ocurrió un error inesperado.");
    }
}

function cerrarModalModificar() {
    const modal = document.getElementById("modal-modificar");
    if (modal) modal.style.display = "none";
}

// ========== Eliminar Reparación ==========
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


async function buscarGlobal() {
    const consulta = document.getElementById("busqueda-global").value.toLowerCase();

    const resVigentes = await fetch('/api/reparaciones');
    const vigentes = await resVigentes.json();

    const resEntregadas = await fetch('/api/entregadas');
    const entregadas = await resEntregadas.json();

    const resultadosVigentes = vigentes.filter(rep =>
        Object.values(rep).some(val => String(val).toLowerCase().includes(consulta))
    );

    const resultadosEntregadas = entregadas.filter(rep =>
        Object.values(rep).some(val => String(val).toLowerCase().includes(consulta))
    );

    renderizarTabla(resultadosVigentes);
    renderizarEntregadas(resultadosEntregadas);
}

// Renderiza resultados de búsqueda y habilita funcionalidades completas
function renderizarBusqueda(tbodyId, resultados) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    tbody.innerHTML = "";
    resultados.forEach(rep => {
        const row = document.createElement("tr");

        // Index original para volver a encontrar la reparación luego
        const realIndex = reparaciones.findIndex(r => r.codigo === rep.codigo);
        row.setAttribute("data-index", realIndex);

        row.innerHTML = `
            <td>${formatearFecha(rep.fechaIngreso)}</td>
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
            <td><span class="semaforo ${obtenerColorEstado(rep.estado)}"></span></td>
            <td><button class="btn-terminado" onclick="marcarTerminado('${rep.codigo}')">Terminado</button></td>
            <td style="text-align: center;">${rep.garantia ? '✔️' : ''}</td>
        `;

        row.addEventListener("click", function () {
            tbody.querySelectorAll("tr").forEach(f => f.classList.remove("seleccionado"));
            this.classList.add("seleccionado");
            codigoActual = rep.codigo;  // ✅ Esto es clave
            console.log("Seleccionaste:", codigoActual);
        });


        row.addEventListener("dblclick", () => visualizarReparacion());

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

async function guardarHistorial() {
    const fecha = document.getElementById("fecha-reparacion").value;
    const cambios = document.getElementById("cambios-reparacion").value.trim();
    const observaciones = document.getElementById("observaciones-reparacion").value.trim();
    const tecnico = document.getElementById("tecnico-reparacion").value.trim();

    if (!codigoActual) {
        alert("Selecciona una reparación antes de agregar historial.");
        return;
    }

    if (!fecha || !cambios || !observaciones || !tecnico) {
        alert("Debes completar todos los campos.");
        return;
    }

    const idx = reparaciones.findIndex(r => r.codigo === codigoActual);
    if (idx === -1) {
        alert("No se encontró la reparación seleccionada.");
        return;
    }

    const garantia = reparaciones[idx].garantia || false;

    const nuevoRegistro = {
        fecha,
        tecnico,
        garantia,
        observaciones,
        repuestos: cambios
    };

    if (!Array.isArray(reparaciones[idx].historial)) {
        reparaciones[idx].historial = [];
    }

    reparaciones[idx].historial.push(nuevoRegistro);

    try {
        const response = await fetch(`/api/reparaciones/${codigoActual}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reparaciones[idx])
        });

        if (!response.ok) throw new Error("Error al guardar historial.");

        cerrarModalAgregarHistorial();
        await cargarReparaciones();

        // Reasignar codigoActual al objeto actualizado
        const nuevoIdx = reparaciones.findIndex(r => r.codigo === codigoActual);
        if (nuevoIdx !== -1) {
            seleccionarFila(nuevoIdx);
            visualizarReparacion(); // Mostrar modal actualizado automáticamente
        }

        // Volver a visualizar el modal con los datos actualizados
        setTimeout(() => {
            visualizarReparacion();
        }, 100);

    } catch (error) {
        console.error("Error al guardar historial:", error);
        alert("No se pudo guardar el historial.");
    }
}

document.addEventListener("click", function (e) {
    const tabla = document.getElementById("reparaciones-tbody");
    const modalHistorial = document.getElementById("modal-historial");
    if (!tabla) return;
    if (!tabla.contains(e.target) && !modalHistorial.contains(e.target)) {
        tabla.querySelectorAll("tr.seleccionado").forEach(tr => tr.classList.remove("seleccionado"));
    }
});

