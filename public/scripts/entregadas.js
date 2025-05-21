document.addEventListener("DOMContentLoaded", () => {
    cargarEntregadas();
});

async function cargarEntregadas() {
    try {
        const response = await fetch('/api/entregadas');
        const entregadas = await response.json();
        renderizarEntregadas(entregadas);
    } catch (error) {
        console.error("Error al cargar entregadas:", error);
    }
}

function renderizarEntregadas(entregadas) {
    const tbody = document.getElementById("entregadas-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    entregadas.forEach(rep => {
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
            <td>${rep.fechaEntrega || "-"}</td>
        `;
        tbody.appendChild(row);
    });
}

// Cargar reparaciones entregadas al iniciar
document.addEventListener("DOMContentLoaded", () => {
    cargarEntregadas();
});

// Función para cargar entregadas
async function cargarEntregadas() {
    try {
        const response = await fetch('/api/entregadas');
        const entregadas = await response.json();
        renderizarEntregadas(entregadas);
    } catch (error) {
        console.error("Error al cargar entregadas:", error);
    }
}

// Renderizar tabla de entregadas
function renderizarEntregadas(entregadas) {
    const tbody = document.getElementById("entregadas-tbody");
    tbody.innerHTML = "";

    entregadas.forEach(rep => {
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
            <td>${rep.fechaEntrega || "-"}</td>
        `;
        tbody.appendChild(row);
    });
}

// Función de búsqueda global
function buscarGlobal() {
    const termino = document.getElementById("busqueda-global").value.toLowerCase();

    // Filtrar en la tabla de entregadas
    const filas = document.querySelectorAll("#entregadas-tbody tr");
    filas.forEach(fila => {
        const texto = fila.textContent.toLowerCase();
        fila.style.display = texto.includes(termino) ? "" : "none";
    });
}

async function buscarGlobal() {
    const consulta = document.getElementById("busqueda-global").value.toLowerCase();

    // Buscar en vigentes
    const resVigentes = await fetch('/api/reparaciones');
    const vigentes = await resVigentes.json();

    // Buscar en entregadas
    const resEntregadas = await fetch('/api/entregadas');
    const entregadas = await resEntregadas.json();

    const resultadosVigentes = vigentes.filter(rep => Object.values(rep).some(val => val.toLowerCase().includes(consulta)));
    const resultadosEntregadas = entregadas.filter(rep => Object.values(rep).some(val => val.toLowerCase().includes(consulta)));

    // Renderizar resultados en las tablas correspondientes
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
            <td>${rep.fechaIngreso || "-"}</td>
            <td>${rep.codigo || "-"}</td>
            <td>${rep.tipo || "-"}</td>
            <td>${rep.modelo || "-"}</td>
            <td>${rep.cliente || "-"}</td>
            <td>${rep.tecnico || "-"}</td>
            <td>${rep.id || "-"}</td>
            <td>${rep.estado || "-"}</td>
            ${rep.fechaEntrega ? `<td>${rep.fechaEntrega}</td>` : ""}
        `;
        tbody.appendChild(row);
    });
}
function buscarGlobal() {
    const query = document.getElementById('busqueda-global').value.toLowerCase();
    const secciones = [
        { id: "reparaciones-tbody", tipo: "vigentes" },
        { id: "entregadas-tbody", tipo: "entregadas" }
    ];

    let totalEncontrados = 0;

    secciones.forEach(sec => {
        const tbody = document.getElementById(sec.id);
        if (!tbody) return;

        const filas = tbody.querySelectorAll("tr");
        let encontrados = 0;

        filas.forEach(fila => {
            const textoFila = fila.innerText.toLowerCase();
            if (textoFila.includes(query)) {
                fila.style.display = "";
                encontrados++;
            } else {
                fila.style.display = "none";
            }
        });

        totalEncontrados += encontrados;
    });

    mostrarNotificacion(totalEncontrados);
}

function mostrarNotificacion(resultados) {
    let notificacion = document.getElementById('notificacion-busqueda');

    if (!notificacion) {
        notificacion = document.createElement('div');
        notificacion.id = 'notificacion-busqueda';
        notificacion.style.position = 'fixed';
        notificacion.style.top = '80px';
        notificacion.style.right = '30px';
        notificacion.style.backgroundColor = '#4da6ff';
        notificacion.style.color = '#fff';
        notificacion.style.padding = '10px 20px';
        notificacion.style.borderRadius = '8px';
        notificacion.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        notificacion.style.zIndex = '1000';
        document.body.appendChild(notificacion);
    }

    if (resultados === 0) {
        notificacion.textContent = "🔍 No se encontraron resultados.";
        notificacion.style.backgroundColor = '#d9534f';
    } else {
        notificacion.textContent = `✅ ${resultados} resultado(s) encontrado(s).`;
        notificacion.style.backgroundColor = '#5cb85c';
    }

    notificacion.style.display = 'block';

    // Ocultar la notificación después de 2.5 segundos
    setTimeout(() => {
        notificacion.style.display = 'none';
    }, 2500);
}

let historialActual = '';
let codigoActual = '';

function visualizarHistorial(codigo) {
    const rep = (reparaciones || entregadas).find(r => r.codigo === codigo);
    if (!rep) return;

    historialActual = rep.historial || '';
    codigoActual = codigo;

    document.getElementById("historial-id").innerText = `ID: ${rep.id}`;
    document.getElementById("historial-encabezado").innerText = `${rep.tipo} - ${rep.modelo} - ${rep.cliente}`;
    document.getElementById("historial-texto").value = historialActual;

    document.getElementById("modal-historial").style.display = "flex";
}

function cerrarModalHistorial() {
    document.getElementById("modal-historial").style.display = "none";
}

function abrirModalAgregarHistorial() {
    document.getElementById("modal-agregar-historial").style.display = "flex";
}

function cerrarModalAgregarHistorial() {
    document.getElementById("modal-agregar-historial").style.display = "none";
}

function guardarHistorial() {
    const nuevoRegistro = document.getElementById("nuevo-historial").value;
    if (!nuevoRegistro.trim()) return alert("Debes ingresar una descripción.");

    historialActual += `\n[${new Date().toLocaleDateString()}] ${nuevoRegistro}`;

    // Actualizar en la fuente de datos (reparaciones o entregadas)
    const dataset = (reparaciones || entregadas);
    const idx = dataset.findIndex(r => r.codigo === codigoActual);
    if (idx !== -1) {
        dataset[idx].historial = historialActual;
    }

    // Recargar visualización
    document.getElementById("historial-texto").value = historialActual;
    cerrarModalAgregarHistorial();
}

