let entregadas = [];

document.addEventListener('DOMContentLoaded', () => {
  const rol = localStorage.getItem('rol');
  if (rol && rol.toLowerCase() === 'cliente' && !window.location.pathname.includes('reparaciones-vigentes')) {
    window.location.href = '/reparaciones-vigentes';
  }
});

document.addEventListener("DOMContentLoaded", () => {
    cargarEntregadas();
});

async function cargarEntregadas() {
    try {
        const response = await fetch('/api/entregadas');
        entregadas = await response.json();
        renderizarEntregadas(entregadas);
    } catch (error) {
        console.error("Error al cargar entregadas:", error);
    }
}

function renderizarEntregadas(entregadas) {
    const tbody = document.getElementById("entregadas-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    // Ordenar por id (numérico, de menor a mayor)
    entregadas.sort((a, b) => {
        const idA = parseInt(String(a.id).match(/\d+/));
        const idB = parseInt(String(b.id).match(/\d+/));
        return idA - idB;
    });

    entregadas.forEach(rep => {
        // Formatear la fecha de entrega a dd/mm/yyyy
        let fechaEntrega = "-";
        if (rep.fechaEntrega) {
            const fecha = new Date(rep.fechaEntrega);
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const anio = fecha.getFullYear();
            fechaEntrega = `${dia}/${mes}/${anio}`;
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td data-label="ID">${rep.id}</td>
            <td data-label="Código">${rep.codigo}</td>
            <td data-label="Tipo">${rep.tipo}</td>
            <td data-label="Modelo">${rep.modelo}</td>
            <td data-label="Cliente">${rep.cliente}</td>
            <td data-label="Fecha de Entrega">${fechaEntrega}</td>
        `;
        row.addEventListener("click", function () {
            tbody.querySelectorAll("tr").forEach(f => f.classList.remove("selected"));
            this.classList.add("selected");
        });
        
        tbody.appendChild(row);
    });
}

// Búsqueda global: SIEMPRE usa el renderizado principal
async function buscarGlobal() {
    const consulta = document.getElementById("busqueda-global").value.toLowerCase();

    const resEntregadas = await fetch('/api/entregadas');
    const entregadas = await resEntregadas.json();

    const resultadosEntregadas = entregadas.filter(rep =>
        Object.values(rep).some(val => String(val).toLowerCase().includes(consulta))
    );

    renderizarEntregadas(resultadosEntregadas);
}

// Notificación de búsqueda
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

function formatearFecha(fechaISO) {
    if (!fechaISO) return "-";
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}


// Historial y modales

let historialActual = '';
let codigoActual = '';

function visualizarHistorial(codigo) {
    const rep = entregadas.find(r => r.codigo === codigo);
    if (!rep) {
        console.error("No se encontró la reparación con el código:", codigo);
        alert("No se pudo encontrar la reparación.");
        return;
    }



    // Asigna el título y datos principales
    document.getElementById("historial-titulo").textContent = `ID: ${rep.id}`;
    document.getElementById("datos-equipo").innerHTML = `
        <p><strong>Código:</strong> ${rep.codigo}</p>
        <p><strong>Tipo:</strong> ${rep.tipo}</p>
        <p><strong>Modelo:</strong> ${rep.modelo}</p>
        <p><strong>Cliente:</strong> ${rep.cliente}</p>
    `;

    // Prepara historial (asegurate de tener array)
    const historialData = Array.isArray(rep.historial) ? rep.historial : [];

    const contenedor = document.getElementById("campo-historial");
    contenedor.innerHTML = historialData.map(evento => `
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

    document.getElementById("modal-historial").style.display = "flex";
}

function visualizarHistorialEntregada() {
    // Verificar que haya una fila seleccionada
    const fila = document.querySelector("#entregadas-tbody tr.selected");
    if (!fila) {
        alert("Por favor, selecciona un equipo primero.");
        return;
    }

    const codigo = fila.children[1].textContent.trim();
    visualizarHistorial(codigo);
}



function cerrarModalHistorial() {
    document.getElementById("modal-historial").style.display = "none";
}

function abrirModalAgregarHistorial() {
    const index = obtenerIndiceSeleccionado();
    console.log("Índice seleccionado:", index, "codigoActual:", codigoActual);
    if (index === -1) {
        alert("Selecciona una reparación primero.");
        return;
    }
    const rep = reparaciones[index];
    codigoActual = rep.codigo;
    document.getElementById("modal-agregar-historial").style.display = "flex";
}

function cerrarModalAgregarHistorial() {
    document.getElementById("modal-agregar-historial").style.display = "none";
}

function guardarHistorial() {
    const nuevoRegistro = document.getElementById("nuevo-historial").value;
    if (!nuevoRegistro.trim()) return alert("Debes ingresar una descripción.");

    historialActual += `\n[${new Date().toLocaleDateString()}] ${nuevoRegistro}`;

    const dataset = (typeof entregadas !== "undefined" ? entregadas : []);
    const idx = dataset.findIndex(r => r.codigo === codigoActual);
    if (idx !== -1) {
        dataset[idx].historial = historialActual;
    }

    // Recargar visualización
    document.getElementById("historial-texto").value = historialActual;
    cerrarModalAgregarHistorial();
}

// Deseleccionar fila al hacer click fuera de la tabla
document.addEventListener("click", function (e) {
    const tabla = document.getElementById("entregadas-tbody");
    if (!tabla) return;
    if (!tabla.contains(e.target)) {
        tabla.querySelectorAll("tr.selected").forEach(tr => tr.classList.remove("selected"));
    }
});

async function recargarEquipoEntregado() {
  const fila = document.querySelector("#entregadas-tbody tr.selected");
  if (!fila) {
    alert("Por favor, selecciona un equipo primero.");
    return;
  }

  const codigo = fila.children[1].textContent.trim();

  // Traemos la reparación seleccionada
  const rep = entregadas.find(r => r.codigo === codigo);
  if (!rep) {
    alert("No se encontró la reparación seleccionada.");
    return;
  }

  // Actualizar la fecha de ingreso al día de hoy (formato yyyy-mm-dd)
  const hoy = new Date();
  rep.fechaIngreso = hoy.toISOString().split("T")[0];
  rep.estado = "Ingreso";

  try {
    // Guardar en reparaciones vigentes
    const response = await fetch('/api/reparaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rep)
    });

    if (!response.ok) {
      const error = await response.json();
      alert(error.error || 'Error al recargar la reparación.');
      return;
    }

    // Eliminar de entregadas
    const delResponse = await fetch(`/api/entregadas/${codigo}`, {
      method: 'DELETE'
    });

    if (!delResponse.ok) {
      const error = await delResponse.json();
      alert(error.error || 'Error al eliminar reparación de entregadas.');
      return;
    }

    alert("Reparación recargada a vigentes con éxito.");
    cargarEntregadas();  // Refrescar tabla de entregadas

  } catch (error) {
    console.error("Error al recargar equipo:", error);
    alert("Error al recargar equipo.");
  }
}

