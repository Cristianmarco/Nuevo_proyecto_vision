// utils.js

export function abrirModal(modal) {
    modal.classList.remove('ocultar');
    modal.classList.add('mostrar');
    modal.style.display = 'flex';
  }
  
  export function cerrarModal(modal) {
    modal.classList.remove('mostrar');
    modal.classList.add('ocultar');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
  
  export function mostrarMensaje(texto) {
    const mensaje = document.getElementById('mensaje-confirmacion');
    mensaje.innerText = texto;
    mensaje.style.display = 'block';
    setTimeout(() => {
      mensaje.style.display = 'none';
    }, 2000);
  }
  
  
  export function manejarNavegacionPaneles({ clientesBtn, stockBtn, clientesPanel, stockPanel, onClientesOpen, onStockOpen }) {
    const entregadasPanel = document.getElementById('entregadas-panel');
    const entregadasBtn = document.getElementById('btn-entregadas');
  
    function ocultarPaneles() {
      clientesPanel.style.display = 'none';
      stockPanel.style.display = 'none';
      if (entregadasPanel) entregadasPanel.style.display = 'none';
    }
  
    clientesBtn.addEventListener('click', async () => {
      ocultarPaneles();
      clientesPanel.style.display = 'block';
      if (onClientesOpen) await onClientesOpen();
    });
  
    stockBtn.addEventListener('click', async () => {
      ocultarPaneles();
      stockPanel.style.display = 'block';
      if (onStockOpen) await onStockOpen();
    });
  
    if (entregadasBtn && entregadasPanel) {
      entregadasBtn.addEventListener('click', async () => {
        ocultarPaneles();
        entregadasPanel.style.display = 'block';
      });
    }
  }
  
  
  