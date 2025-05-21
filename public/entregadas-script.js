// entregadas-script.js

import { mostrarMensaje } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const entregadasPanel = document.getElementById('entregadas-panel');
  const entregadasBtn = document.getElementById('btn-entregadas');
  const tbody = entregadasPanel.querySelector('tbody');

  entregadasBtn.addEventListener('click', async () => {
    document.getElementById('clientes-panel').style.display = 'none';
    document.getElementById('stock-panel').style.display = 'none';
    entregadasPanel.style.display = 'block';
    await cargarEntregadas();
  });

  async function cargarEntregadas() {
    try {
      const res = await fetch('/api/entregadas');
      const datos = await res.json();
      tbody.innerHTML = '';
      datos.forEach(rep => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${rep.fechaIngreso}</td>
          <td>${rep.codigo}</td>
          <td>${rep.tipo}</td>
          <td>${rep.modelo}</td>
          <td>${rep.cliente}</td>
          <td>${rep.tecnico}</td>
          <td>${rep.id}</td>
          <td>${rep.estado}</td>`;
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('Error al cargar entregadas:', err);
      mostrarMensaje('❌ Error al obtener entregadas');
    }
  }
});
