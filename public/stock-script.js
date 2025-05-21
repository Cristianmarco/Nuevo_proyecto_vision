// stock-script.js

import { abrirModal, cerrarModal, mostrarMensaje } from './utils.js';

function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

document.addEventListener('DOMContentLoaded', async function () {
  const stockPanel = document.getElementById('stock-panel');
  const stockBtn = document.getElementById('btn-stock');
  const agregarStockBtn = stockPanel.querySelector('.agregar');
  const modificarStockBtn = stockPanel.querySelector('.modificar');
  const eliminarStockBtn = stockPanel.querySelector('.eliminar');
  const visualizarStockBtn = stockPanel.querySelector('.visualizar');

  const modalAgregar = document.getElementById('modalAgregarStock');
  const cerrarAgregar = document.getElementById('cerrarModalAgregarReparacion');
  const formAgregar = document.getElementById('formAgregarStock');
  const tituloModal = document.getElementById('tituloModalReparacion');

  const clienteSelect = formAgregar.querySelector('[name="cliente"]');
  const estadoSelect = formAgregar.querySelector('[name="estado"]');
  const tipoSelect = formAgregar.querySelector('[name="tipo"]');
  const tecnicoSelect = formAgregar.querySelector('[name="tecnico"]');
  const fechaInput = formAgregar.querySelector('[name="fechaIngreso"]');
  const tbody = stockPanel.querySelector('tbody');
  const modalVisualizar = document.getElementById('modalVisualizarReparacion');
  const cerrarVisualizar = document.getElementById('cerrarModalVisualizarReparacion');

  let filaSeleccionada = null;
  let entregadasCargadas = false;

  const estadosColores = {
    'Ingreso': '#00cc66',
    'Desarme': '#33ccff',
    'Esperando Repuesto': '#ffcc80',
    'Esperando Confirmacion': '#ffff66',
    'Salida': '#ff4d4d'
  };

  estadoSelect.innerHTML = '<option value="">Seleccionar estado</option>' +
    Object.keys(estadosColores).map(e => `<option value="${e}">${e}</option>`).join('');

  tipoSelect.innerHTML = '<option value="">Seleccionar tipo</option>' +
    ['Alternador', 'Arranque', 'Motor de Calefaccion', 'Motor LP', 'Motor EV', 'Rotor', 'Estator']
      .map(t => `<option value="${t}">${t}</option>`).join('');

  tecnicoSelect.innerHTML = '<option value="">Seleccionar técnico</option>' +
    ['Beto', 'Carlos', 'Crespo', 'Kity', 'Nacho'].sort()
      .map(t => `<option value="${t}">${t}</option>`).join('');

  async function cargarClientesEnSelect() {
    try {
      const res = await fetch('/api/clientes');
      const clientes = await res.json();
      clientes.sort((a, b) => a.nombreFantasia.localeCompare(b.nombreFantasia));
      clienteSelect.innerHTML = '<option value="">Seleccionar cliente</option>' +
        clientes.map(c => `<option value="${c.nombreFantasia}">${c.nombreFantasia} (${c.codigo})</option>`).join('');
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    }
  }

  function resaltarSiAntigua(fechaStr, td) {
    const hoy = new Date();
    const fecha = new Date(fechaStr);
    const diffDias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
    if (diffDias > 21) {
      td.style.backgroundColor = '#e6f0ff';
      td.style.fontWeight = 'bold';
    } else {
      td.style.backgroundColor = '';
      td.style.fontWeight = '';
    }
  }

  async function cargarStock() {
    try {
      const res = await fetch('/api/stock');
      const datos = await res.json();
      tbody.innerHTML = '';
      datos.forEach(rep => {
        const tr = document.createElement('tr');
        const tdFecha = document.createElement('td');
        tdFecha.textContent = formatearFecha(rep.fechaIngreso);
        resaltarSiAntigua(rep.fechaIngreso, tdFecha);
        tr.appendChild(tdFecha);

        tr.innerHTML += `
          <td>${rep.codigo}</td>
          <td>${rep.tipo}</td>
          <td>${rep.modelo}</td>
          <td>${rep.cliente}</td>
          <td>${rep.tecnico}</td>
          <td>${rep.id}</td>`;

        const tdEstado = document.createElement('td');
        tdEstado.textContent = rep.estado;
        tdEstado.style.borderRight = `8px solid ${estadosColores[rep.estado] || 'transparent'}`;
        tr.appendChild(tdEstado);

        const tdTerminar = document.createElement('td');
        const btnTerminar = document.createElement('button');
        btnTerminar.textContent = 'Terminado';
        btnTerminar.classList.add('btn-terminado');
        btnTerminar.addEventListener('click', async () => {
          const fechaEntrega = new Date().toISOString().split('T')[0];
          const repConEntrega = { ...rep, fechaEntrega };

          try {
            const resEnt = await fetch('/api/entregadas', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(repConEntrega)
            });

            if (resEnt.ok) {
              await fetch(`/api/stock/${rep.codigo}`, { method: 'DELETE' });
              await cargarStock();
              mostrarMensaje('✅ Reparación marcada como entregada');
            }
          } catch (error) {
            console.error('Error al entregar:', error);
            mostrarMensaje('❌ Error al marcar como entregada');
          }
        });
        tdTerminar.appendChild(btnTerminar);
        tr.appendChild(tdTerminar);

        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('Error al cargar stock:', err);
      mostrarMensaje('❌ Error al obtener reparaciones');
    }
  }

  stockBtn.addEventListener('click', async () => {
    document.getElementById('clientes-panel').style.display = 'none';
    document.getElementById('entregadas-panel').style.display = 'none';
    stockPanel.style.display = 'block';
    await cargarStock();
  });

  tbody.addEventListener('click', e => {
    const fila = e.target.closest('tr');
    if (fila) {
      tbody.querySelectorAll('tr').forEach(tr => tr.classList.remove('seleccionado'));
      fila.classList.add('seleccionado');
      filaSeleccionada = fila;
    }
  });

  agregarStockBtn.addEventListener('click', () => {
    tituloModal.textContent = 'Agregar Reparación';
    formAgregar.reset();
    formAgregar.removeAttribute('data-modificando');
    cargarClientesEnSelect();
    abrirModal(modalAgregar);
  });

  modificarStockBtn.addEventListener('click', () => {
    if (filaSeleccionada) {
      const celdas = filaSeleccionada.querySelectorAll('td');
      formAgregar.fechaIngreso.value = celdas[0].innerText;
      formAgregar.codigo.value = celdas[1].innerText;
      formAgregar.tipo.value = celdas[2].innerText;
      formAgregar.modelo.value = celdas[3].innerText;
      cargarClientesEnSelect();
      formAgregar.cliente.value = celdas[4].innerText;
      formAgregar.tecnico.value = celdas[5].innerText;
      formAgregar.id.value = celdas[6].innerText;
      formAgregar.estado.value = celdas[7].innerText;
      formAgregar.setAttribute('data-modificando', 'true');
      tituloModal.textContent = 'Modificar Reparación';
      abrirModal(modalAgregar);
    } else {
      alert('Seleccioná una reparación primero.');
    }
  });

  eliminarStockBtn.addEventListener('click', async () => {
    if (filaSeleccionada) {
      const codigo = filaSeleccionada.children[1].innerText;
      if (confirm(`¿Seguro que querés eliminar la reparación con código ${codigo}?`)) {
        try {
          const res = await fetch(`/api/stock/${codigo}`, { method: 'DELETE' });
          if (res.ok) {
            filaSeleccionada.remove();
            filaSeleccionada = null;
            mostrarMensaje('✅ Reparación eliminada');
          } else {
            const data = await res.json();
            mostrarMensaje(`⚠️ ${data.error}`);
          }
        } catch (err) {
          console.error(err);
          mostrarMensaje('❌ Error de conexión');
        }
      }
    } else {
      alert('Seleccioná una reparación primero.');
    }
  });

  visualizarStockBtn.addEventListener('click', () => {
    if (filaSeleccionada) {
      const celdas = filaSeleccionada.querySelectorAll('td');
      document.getElementById('ver-fechaIngreso').value = celdas[0].innerText;
      document.getElementById('ver-codigo-rep').value = celdas[1].innerText;
      document.getElementById('ver-tipo').value = celdas[2].innerText;
      document.getElementById('ver-modelo').value = celdas[3].innerText;
      document.getElementById('ver-cliente').value = celdas[4].innerText;
      document.getElementById('ver-tecnico').value = celdas[5].innerText;
      document.getElementById('ver-id').value = celdas[6].innerText;
      document.getElementById('ver-estado').value = celdas[7].innerText;
      abrirModal(modalVisualizar);
    } else {
      alert('Seleccioná una reparación primero.');
    }
  });

  cerrarAgregar.addEventListener('click', () => cerrarModal(modalAgregar));
  cerrarVisualizar.addEventListener('click', () => cerrarModal(modalVisualizar));

  window.addEventListener('click', e => {
    if (e.target === modalAgregar) cerrarModal(modalAgregar);
    if (e.target === modalVisualizar) cerrarModal(modalVisualizar);
  });

  formAgregar.addEventListener('submit', async e => {
    e.preventDefault();
    const datos = new FormData(formAgregar);
    const reparacion = Object.fromEntries(datos.entries());
    const modificando = formAgregar.getAttribute('data-modificando') === 'true';
    try {
      const response = await fetch(modificando ? `/api/stock/${reparacion.codigo}` : '/api/stock', {
        method: modificando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reparacion)
      });
      if (response.ok) {
        await cargarStock();
        mostrarMensaje(modificando ? '✅ Reparación modificada' : '✅ Reparación agregada');
        cerrarModal(modalAgregar);
        formAgregar.reset();
        formAgregar.removeAttribute('data-modificando');
        tituloModal.textContent = 'Agregar Reparación';
      } else {
        mostrarMensaje('⚠️ Error al guardar la reparación');
      }
    } catch (err) {
      console.error('Error al guardar reparación:', err);
      mostrarMensaje('❌ Error de conexión');
    }
  });

  const entregadasPanel = document.getElementById('entregadas-panel');
  const entregadasBtn = document.getElementById('btn-entregadas');

  entregadasBtn.addEventListener('click', async () => {
    document.getElementById('clientes-panel').style.display = 'none';
    stockPanel.style.display = 'none';
    entregadasPanel.style.display = 'block';
    await cargarEntregadas();
  });

  async function cargarEntregadas() {
    try {
      const res = await fetch('/api/entregadas');
      const entregadas = await res.json();
      const tbodyEntregadas = entregadasPanel.querySelector('tbody');
      tbodyEntregadas.innerHTML = '';
      entregadas.forEach(rep => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${formatearFecha(rep.fechaIngreso)}</td>
          <td>${rep.codigo}</td>
          <td>${rep.tipo}</td>
          <td>${rep.modelo}</td>
          <td>${rep.cliente}</td>
          <td>${rep.tecnico || ''}</td>
          <td>${rep.id || ''}</td>
          <td>${rep.estado}</td>
          <td>${rep.fechaEntrega ? formatearFecha(rep.fechaEntrega) : ''}</td>`;
        tbodyEntregadas.appendChild(tr);
      });
    } catch (err) {
      console.error('Error al cargar entregadas:', err);
      mostrarMensaje('❌ Error al obtener entregadas');
    }
  }

  const campoBusqueda = document.getElementById('busqueda-global');

  campoBusqueda.addEventListener('input', async () => {
    const filtro = campoBusqueda.value.toLowerCase();

    if (!entregadasCargadas) {
      await cargarEntregadas();
      entregadasCargadas = true;
    }

    await cargarStock();

    const tablas = [
      document.querySelector('#stock-panel table'),
      document.querySelector('#entregadas-panel table')
    ];

    tablas.forEach(tabla => {
      if (!tabla) return;
      const filas = tabla.querySelectorAll('tbody tr');
      filas.forEach(fila => {
        const textoFila = fila.innerText.toLowerCase();
        fila.style.display = textoFila.includes(filtro) ? '' : 'none';
      });
    });
  });
});
