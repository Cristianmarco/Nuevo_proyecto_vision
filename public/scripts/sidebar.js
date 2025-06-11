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
