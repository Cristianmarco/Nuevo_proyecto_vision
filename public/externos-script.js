// externos-script.js

console.log('Externos script cargado');

import { abrirModal, cerrarModal, mostrarMensaje, manejarNavegacionPaneles } from './utils.js';

document.addEventListener('DOMContentLoaded', async function () {
  const clientesPanel = document.getElementById('clientes-panel');
  const stockPanel = document.getElementById('stock-panel');
  const clientesBtn = document.getElementById('btn-clientes');
  const stockBtn = document.getElementById('btn-stock');

  manejarNavegacionPaneles({
    clientesBtn,
    stockBtn,
    clientesPanel,
    stockPanel,
    onClientesOpen: cargarClientes
  });
  

  const agregarClienteButton = clientesPanel.querySelector('.agregar');
  const modificarClienteButton = clientesPanel.querySelector('.modificar');
  const eliminarClienteButton = clientesPanel.querySelector('.eliminar');
  const visualizarClienteButton = clientesPanel.querySelector('.visualizar');

  const modalAgregar = document.getElementById('modalAgregarCliente');
  const cerrarAgregar = document.getElementById('cerrarModalAgregar');
  const formAgregarCliente = document.getElementById('formAgregarCliente');

  const modalVisualizar = document.getElementById('modalVisualizarCliente');
  const cerrarVisualizar = document.getElementById('cerrarModalVisualizar');

  const tbodyClientes = clientesPanel.querySelector('tbody');
  const tituloModalAgregar = modalAgregar.querySelector('h2');

  let filaSeleccionadaClientes = null;

  tbodyClientes.addEventListener('click', function (e) {
    const fila = e.target.closest('tr');
    if (fila) {
      tbodyClientes.querySelectorAll('tr').forEach(tr => tr.classList.remove('seleccionado'));
      fila.classList.add('seleccionado');
      filaSeleccionadaClientes = fila;
    }
  });

  agregarClienteButton.addEventListener('click', () => {
    tituloModalAgregar.textContent = 'Agregar Cliente';
    formAgregarCliente.reset();
    formAgregarCliente.removeAttribute('data-modificando');
    formAgregarCliente.codigo.readOnly = false;
    abrirModal(modalAgregar);
  });

  modificarClienteButton.addEventListener('click', () => {
    if (filaSeleccionadaClientes) {
      const celdas = filaSeleccionadaClientes.querySelectorAll('td');
      formAgregarCliente.codigo.value = celdas[0].innerText;
      formAgregarCliente.nombreFantasia.value = celdas[1].innerText;
      formAgregarCliente.razonSocial.value = celdas[2].innerText;
      formAgregarCliente.domicilio.value = celdas[3].innerText;
      formAgregarCliente.localidad.value = celdas[4].innerText;
      formAgregarCliente.provincia.value = celdas[5].innerText;
      formAgregarCliente.telefono.value = celdas[6].innerText;
      formAgregarCliente.email.value = celdas[7].innerText;
      formAgregarCliente.cuit.value = celdas[8].innerText;

      formAgregarCliente.codigo.readOnly = true;
      formAgregarCliente.setAttribute('data-modificando', 'true');
      tituloModalAgregar.textContent = 'Modificar Cliente';
      abrirModal(modalAgregar);
    } else {
      alert('Seleccioná un cliente primero.');
    }
  });

  visualizarClienteButton.addEventListener('click', () => {
    if (filaSeleccionadaClientes) {
      const celdas = filaSeleccionadaClientes.querySelectorAll('td');
      document.getElementById('ver-codigo').value = celdas[0].innerText;
      document.getElementById('ver-nombreFantasia').value = celdas[1].innerText;
      document.getElementById('ver-razonSocial').value = celdas[2].innerText;
      document.getElementById('ver-domicilio').value = celdas[3].innerText;
      document.getElementById('ver-localidad').value = celdas[4].innerText;
      document.getElementById('ver-provincia').value = celdas[5].innerText;
      document.getElementById('ver-telefono').value = celdas[6].innerText;
      document.getElementById('ver-email').value = celdas[7].innerText;
      document.getElementById('ver-cuit').value = celdas[8].innerText;
      abrirModal(modalVisualizar);
    } else {
      alert('Seleccioná un cliente primero.');
    }
  });

  eliminarClienteButton.addEventListener('click', async () => {
    if (filaSeleccionadaClientes) {
      const codigo = filaSeleccionadaClientes.querySelector('td').innerText;
      if (confirm(`¿Seguro que querés eliminar el cliente con código ${codigo}?`)) {
        try {
          const res = await fetch(`/api/clientes/${codigo}`, { method: 'DELETE' });
          if (res.ok) {
            filaSeleccionadaClientes.remove();
            filaSeleccionadaClientes = null;
            mostrarMensaje('✅ Cliente eliminado');
          } else {
            const data = await res.json();
            mostrarMensaje(`⚠️ ${data.error}`);
          }
        } catch (error) {
          console.error(error);
          mostrarMensaje('❌ Error al conectar con el servidor');
        }
      }
    } else {
      alert('Seleccioná un cliente primero.');
    }
  });

  cerrarAgregar.addEventListener('click', () => cerrarModal(modalAgregar));
  cerrarVisualizar.addEventListener('click', () => cerrarModal(modalVisualizar));

  window.addEventListener('click', (e) => {
    if (e.target === modalAgregar) cerrarModal(modalAgregar);
    if (e.target === modalVisualizar) cerrarModal(modalVisualizar);
  });

  formAgregarCliente.addEventListener('submit', async function (e) {
    e.preventDefault();
    const boton = formAgregarCliente.querySelector('.btn-guardar');
    boton.classList.add('clicked');
    setTimeout(() => boton.classList.remove('clicked'), 300);

    const datos = new FormData(formAgregarCliente);
    const cliente = Object.fromEntries(datos.entries());
    const modificando = formAgregarCliente.getAttribute('data-modificando') === 'true';

    try {
      const response = await fetch(modificando ? `/api/clientes/${cliente.codigo}` : '/api/clientes', {
        method: modificando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
      });

      if (response.ok) {
        await cargarClientes();
        mostrarMensaje(modificando ? '✅ Cliente modificado con éxito' : '✅ Cliente agregado con éxito');
        cerrarModal(modalAgregar);
        formAgregarCliente.reset();
        formAgregarCliente.removeAttribute('data-modificando');
        formAgregarCliente.codigo.readOnly = false;
        tituloModalAgregar.textContent = 'Agregar Cliente';
      } else {
        mostrarMensaje('⚠️ Error al guardar el cliente');
      }
    } catch (error) {
      console.error(error);
      mostrarMensaje('❌ Error en la conexión con el servidor');
    }
  });

  async function cargarClientes() {
    try {
      const res = await fetch('/api/clientes');
      const clientes = await res.json();
      tbodyClientes.innerHTML = '';
      clientes.sort((a, b) => parseInt(a.codigo) - parseInt(b.codigo)).forEach(cliente => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${cliente.codigo}</td>
          <td>${cliente.nombreFantasia}</td>
          <td>${cliente.razonSocial}</td>
          <td>${cliente.domicilio}</td>
          <td>${cliente.localidad}</td>
          <td>${cliente.provincia}</td>
          <td>${cliente.telefono}</td>
          <td>${cliente.email}</td>
          <td>${cliente.cuit}</td>`;
        tbodyClientes.appendChild(fila);
      });
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      mostrarMensaje('❌ Error al obtener los clientes');
    }
  }
});
