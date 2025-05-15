document.addEventListener("DOMContentLoaded", () => {
    cargarEntregadas();
});

async function cargarEntregadas() {
    try {
        const response = await fetch('/api/entregadas');
        const entregadas = await response.json();
        renderizarEntregadas(entregadas);
    } catch (error) {
        console.error("Error al cargar entregadas:", error);
    }
}

function renderizarEntregadas(entregadas) {
    const tbody = document.getElementById("entregadas-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    entregadas.forEach(rep => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${rep.fechaIngreso}</td>
            <td>${rep.codigo}</td>
            <td>${rep.tipo}</td>
            <td>${rep.modelo}</td>
            <td>${rep.cliente}</td>
            <td>${rep.tecnico}</td>
            <td>${rep.id}</td>
            <td>${rep.estado}</td>
            <td>${rep.fechaEntrega || "-"}</td>
        `;
        tbody.appendChild(row);
    });
}
