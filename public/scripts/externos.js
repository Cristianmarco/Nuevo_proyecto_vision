function irAClientes() {
  window.location.href = '/externos-clientes';
}

function mostrarSubmenuReparaciones() {
  document.getElementById("seccion-principal").style.display = "none";
  document.getElementById("submenu-reparaciones").style.display = "flex";
}

function volverASeccionPrincipal() {
  document.getElementById("submenu-reparaciones").style.display = "none";
  const principal = document.getElementById("seccion-principal");
  principal.style.display = "flex";
  principal.style.flexDirection = "row"; // Asegura que las fichas vuelvan a estar en línea
  principal.style.gap = "20px";
}
