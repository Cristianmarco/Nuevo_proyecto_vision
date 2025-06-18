console.log("sidebar.js ejecutado - rol:", localStorage.getItem('rol'));


document.addEventListener('DOMContentLoaded', () => {
  const rol = localStorage.getItem('rol');
  if (rol && rol.toLowerCase() === 'cliente') {
    // Muestra solo la opción de reparaciones vigentes
    const sidebar = document.querySelector('.sidebar nav ul');
    if (sidebar) {
      sidebar.innerHTML = `
        <li>
          <button class="sidebar-btn" onclick="irA('reparaciones-vigentes')">
            <i class="fas fa-tools"></i> Reparaciones Vigentes
          </button>
        </li>
      `;
    }
    // Redirecciona si está en otra sección
    if (!window.location.pathname.includes('reparaciones-vigentes')) {
      window.location.href = '/reparaciones-vigentes';
    }
  }
});

function toggleSubmenu() {
  const submenu = document.getElementById('clientes-submenu');
  const icon = document.getElementById('submenu-icon');

  if (submenu.style.display === 'flex') {
    submenu.style.display = 'none';
    icon.classList.remove('rotate');
  } else {
    submenu.style.display = 'flex';
    icon.classList.add('rotate');
  }
}

function irA(seccion) {
  switch (seccion) {
    case 'main':
      window.location.href = '/main';
      break;
    case 'clientes':
      window.location.href = '/clientes';
      break;
    case 'reparaciones-vigentes':
      window.location.href = '/reparaciones-vigentes';
      break;
    case 'historial':
      window.location.href = '/historial';
      break;
    default:
      console.warn('Sección no reconocida:', seccion);
  }
}

function logout() {
  if (confirm('¿Seguro que deseas salir?')) {
    localStorage.removeItem('rol');
    localStorage.removeItem('username');
    localStorage.removeItem('cliente');
    window.location.href = '/';
  }
}

