document.addEventListener("DOMContentLoaded", () => {
  cargarUsuarios();

  const usuarioForm = document.getElementById("usuarioForm");
  usuarioForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await guardarUsuario();
  });
});

async function cargarUsuarios() {
  try {
    const response = await fetch("/api/usuarios");
    if (!response.ok) throw new Error("Error al cargar usuarios");
    const usuarios = await response.json();

    const tbody = document.querySelector("#tabla-usuarios tbody");
    tbody.innerHTML = ""; // Limpiar tabla

    usuarios.forEach((usuario) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${usuario.email}</td>
        <td>${usuario.rol}</td>
        <td>
          <button onclick="editarUsuario('${usuario.email}')">Editar</button>
          <button onclick="eliminarUsuario('${usuario.email}')">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

function mostrarFormularioNuevoUsuario() {
  document.getElementById("formulario-nuevo").style.display = "block";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("rol").value = "cliente";
}

async function guardarUsuario() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const rol = document.getElementById("rol").value;

  try {
    const response = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rol })
    });
    if (!response.ok) throw new Error("Error al guardar usuario");
    alert("Usuario guardado correctamente");
    document.getElementById("formulario-nuevo").style.display = "none";
    cargarUsuarios();
  } catch (err) {
    console.error(err);
    alert("Error al guardar usuario");
  }
}



async function eliminarUsuario(email) {
  if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

  try {
    const response = await fetch(`/api/usuarios/${email}`, {
      method: "DELETE"
    });
    if (!response.ok) throw new Error("Error al eliminar usuario");
    alert("Usuario eliminado correctamente");
    cargarUsuarios();
  } catch (err) {
    console.error(err);
    alert("Error al eliminar usuario");
  }
}

function editarUsuario(email) {
  // Por simplicidad, usar email como ID
  const fila = Array.from(document.querySelectorAll("#tabla-usuarios tbody tr"))
    .find(tr => tr.children[0].textContent === email);

  if (fila) {
    document.getElementById("formulario-nuevo").style.display = "block";
    document.getElementById("email").value = email;
    document.getElementById("password").value = "";
    document.getElementById("rol").value = fila.children[1].textContent;
  }
}
