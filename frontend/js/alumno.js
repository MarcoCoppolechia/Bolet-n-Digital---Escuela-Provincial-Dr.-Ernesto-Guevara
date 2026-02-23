// ========== CONFIGURACIÓN ==========
const API_URL = 'http://localhost:5000/api';

// ========== VERIFICAR SESIÓN ==========
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'index.html';
} else if (currentUser.rol !== 'alumno') {
    alert('Acceso no autorizado');
    window.location.href = 'index.html';
}

// ========== DATOS DEL ALUMNO ==========
document.getElementById('nombre-alumno').textContent = currentUser.nombre;
document.getElementById('curso-alumno').textContent = currentUser.curso_nombre || '7° 1°';
document.getElementById('anio-actual').textContent = new Date().getFullYear();

// ========== CARGAR NOTAS DESDE EL BACKEND ==========
async function cargarNotas() {
    try {
        const response = await fetch(`${API_URL}/boletin/${currentUser.id}`);
        if (!response.ok) throw new Error('Error al cargar boletín');
        const notas = await response.json();

        // Agrupar por materia
        const materiasMap = {};
        notas.forEach(item => {
            if (!materiasMap[item.id_materia]) {
                materiasMap[item.id_materia] = {
                    nombre: item.materia_nombre,
                    notas: {}
                };
            }
            materiasMap[item.id_materia].notas[item.tipo_nota] = item.nota;
        });

        const tbody = document.getElementById('notas-tbody');
        tbody.innerHTML = '';

        // Recorrer las materias en el orden que aparecen en la base de datos
        // Si no importa el orden, podemos usar Object.values()
        // Para mantener el orden de inserción, usamos un array de ids
        const materiasOrdenadas = Object.keys(materiasMap).sort((a, b) => a - b); // por id_materia
        materiasOrdenadas.forEach(id => {
            const m = materiasMap[id];
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${m.nombre}</td>
                <td>${m.notas['informe1_c1'] || ''}</td>
                <td>${m.notas['informe2_c1'] || ''}</td>
                <td>${m.notas['cuatrimestre1'] || ''}</td>
                <td>${m.notas['informe1_c2'] || ''}</td>
                <td>${m.notas['informe2_c2'] || ''}</td>
                <td>${m.notas['cuatrimestre2'] || ''}</td>
                <td>${m.notas['nota_final'] || ''}</td>
            `;
            tbody.appendChild(tr);
        });

        // Si no hay notas, mostrar mensaje
        if (materiasOrdenadas.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="8" style="text-align: center;">No hay notas cargadas</td>';
            tbody.appendChild(tr);
        }
    } catch (error) {
        console.error('Error:', error);
        const tbody = document.getElementById('notas-tbody');
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">Error al cargar las notas</td></tr>';
    }
}

// ========== CERRAR SESIÓN ==========
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// ========== INICIALIZAR ==========
cargarNotas();