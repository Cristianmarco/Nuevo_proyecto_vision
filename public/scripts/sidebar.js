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
