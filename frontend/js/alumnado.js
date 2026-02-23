// ========== CONFIGURACIÓN ==========
const API_URL = 'http://localhost:5000/api';

// ========== DATOS ==========
let subjects = [];
let courses = [];
let students = []; // solo alumnos
let notasOriginales = [];
let filteredNotas = [];
let filteredStudents = [];

// ========== ELEMENTOS DOM ==========
const tabs = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');

// ========== CAMBIO DE PESTAÑAS ==========
tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabId = tab.getAttribute('data-tab');
        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');

        if (tabId === 'grades') {
            loadCoursesSelect();
            loadSubjectsSelect();
            loadNotas();
        }
        if (tabId === 'students') {
            loadStudents();
        }
    });
});

// ========== FUNCIONES PARA CURSOS ==========
async function loadCourses() {
    try {
        const response = await fetch(`${API_URL}/curso`);
        if (!response.ok) throw new Error('Error al cargar cursos');
        courses = await response.json();
        loadCoursesSelect();
        loadFilterCourse();
    } catch (error) {
        console.error(error);
        courses = [];
    }
}

function loadCoursesSelect() {
    const select = document.getElementById('gradeCourse');
    if (!select) return;
    select.innerHTML = '<option value="">Seleccionar curso</option>';
    courses.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.nombre || (c.año + '° ' + c.division)}</option>`;
    });
}

function loadFilterCourse() {
    const select = document.getElementById('filterCourseStudent');
    if (!select) return;
    select.innerHTML = '<option value="">Todos los cursos</option>';
    courses.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.nombre || (c.año + '° ' + c.division)}</option>`;
    });
}

// ========== FUNCIONES PARA MATERIAS ==========
async function loadSubjects() {
    try {
        const response = await fetch(`${API_URL}/materia`);
        if (!response.ok) throw new Error('Error al cargar materias');
        subjects = await response.json();
        loadSubjectsSelect();
    } catch (error) {
        console.error(error);
        subjects = [];
    }
}

function loadSubjectsSelect() {
    const select = document.getElementById('gradeSubject');
    if (!select) return;
    select.innerHTML = '<option value="">Seleccionar materia</option>';
    subjects.forEach(s => {
        select.innerHTML += `<option value="${s.id}">${s.nombre}</option>`;
    });
}

// ========== FUNCIONES PARA ALUMNOS ==========
async function loadStudents() {
    try {
        const response = await fetch(`${API_URL}/usuarios`);
        if (!response.ok) throw new Error('Error al cargar alumnos');
        const users = await response.json();
        students = users.filter(u => u.rol === 'alumno');
        filteredStudents = [...students];
        renderStudents();
    } catch (error) {
        console.error(error);
        students = [];
        filteredStudents = [];
        renderStudents();
    }
}

function renderStudents() {
    const tbody = document.querySelector('#studentsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    filteredStudents.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${s.id}</td>
            <td>${s.nombre}</td>
            <td>${s.email}</td>
            <td>${s.curso_nombre || '-'}</td>
            <td>
                <button class="btn-sm" onclick="verBoletin(${s.id})">Ver boletín</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Búsqueda y filtro de alumnos
document.getElementById('searchStudent')?.addEventListener('input', function(e) {
    const term = e.target.value.toLowerCase();
    filtrarAlumnos(term, document.getElementById('filterCourseStudent').value);
});

document.getElementById('filterCourseStudent')?.addEventListener('change', function(e) {
    const courseId = e.target.value;
    filtrarAlumnos(document.getElementById('searchStudent').value.toLowerCase(), courseId);
});

function filtrarAlumnos(searchTerm, courseId) {
    filteredStudents = students.filter(s => {
        const matchNombre = s.nombre.toLowerCase().includes(searchTerm);
        const matchCurso = courseId ? s.id_curso == courseId : true;
        return matchNombre && matchCurso;
    });
    renderStudents();
}

// ========== FUNCIONES PARA NOTAS ==========
async function loadNotas() {
    try {
        const response = await fetch(`${API_URL}/notas`);
        if (!response.ok) throw new Error('Error al cargar notas');
        notasOriginales = await response.json();
        filtrarNotas();
    } catch (error) {
        console.error(error);
        notasOriginales = [];
        filteredNotas = [];
        renderNotas();
    }
}

let searchTermNotas = '';
document.getElementById('searchNotas')?.addEventListener('input', function(e) {
    searchTermNotas = e.target.value.toLowerCase();
    filtrarNotas();
});

function filtrarNotas() {
    if (!searchTermNotas) {
        filteredNotas = [...notasOriginales];
    } else {
        filteredNotas = notasOriginales.filter(n => 
            n.alumno_nombre.toLowerCase().includes(searchTermNotas)
        );
    }
    renderNotas();
}

function renderNotas() {
    const tbody = document.querySelector('#gradesTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    filteredNotas.forEach(nota => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${nota.alumno_nombre}</td>
            <td>${nota.materia_nombre}</td>
            <td>${traducirTipo(nota.tipo_nota)}</td>
            <td>${nota.nota}</td>
            <td>${new Date(nota.fecha).toLocaleDateString()}</td>
            <td>
                <button class="btn-sm btn-danger" onclick="deleteNota(${nota.id_nota})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function traducirTipo(tipo) {
    const tipos = {
        'informe1_c1': '1er Informe (1C)',
        'informe2_c1': '2do Informe (1C)',
        'cuatrimestre1': '1er Cuatrimestre',
        'informe1_c2': '1er Informe (2C)',
        'informe2_c2': '2do Informe (2C)',
        'cuatrimestre2': '2do Cuatrimestre',
        'nota_final': 'Nota Final'
    };
    return tipos[tipo] || tipo;
}

window.deleteNota = (id) => {
    if (!confirm('¿Eliminar nota?')) return;
    fetch(`${API_URL}/notas/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if (data.error) alert('Error: ' + data.error);
            else {
                alert(data.message);
                loadNotas();
            }
        })
        .catch(err => {
            console.error(err);
            alert('Error de conexión');
        });
};
// ========== FUNCIÓN PARA VER BOLETÍN ==========
window.verBoletin = async (idAlumno) => {
    try {
        // Obtener datos del alumno
        const alumno = students.find(s => s.id === idAlumno);
        if (!alumno) return;

        // Obtener notas del alumno
        const response = await fetch(`${API_URL}/boletin/${idAlumno}`);
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

        // Construir tabla HTML
        let html = `
            <div class="boletin-header">
                <div class="header-left">
                    <h2>Ciclo Superior de la ESO</h2>
                    <p><strong>Curso:</strong> ${alumno.curso_nombre || 'Sin curso'}</p>
                </div>
                <div class="header-right">
                    <p><strong>Año:</strong> ${new Date().getFullYear()}</p>
                    <p><strong>Nombre y Apellido:</strong> ${alumno.nombre}</p>
                </div>
            </div>
            <div class="table-responsive">
                <table class="boletin-table">
                    <thead>
                        <tr>
                            <th>Asignaturas</th>
                            <th>1er Informe (1C)</th>
                            <th>2do Informe (1C)</th>
                            <th>1er Cuatrimestre</th>
                            <th>1er Informe (2C)</th>
                            <th>2do Informe (2C)</th>
                            <th>2do Cuatrimestre</th>
                            <th>Nota Final</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Ordenar materias por id
        const materiasOrdenadas = Object.keys(materiasMap).sort((a, b) => a - b);
        materiasOrdenadas.forEach(id => {
            const m = materiasMap[id];
            html += `
                <tr>
                    <td>${m.nombre}</td>
                    <td>${m.notas['informe1_c1'] || ''}</td>
                    <td>${m.notas['informe2_c1'] || ''}</td>
                    <td>${m.notas['cuatrimestre1'] || ''}</td>
                    <td>${m.notas['informe1_c2'] || ''}</td>
                    <td>${m.notas['informe2_c2'] || ''}</td>
                    <td>${m.notas['cuatrimestre2'] || ''}</td>
                    <td>${m.notas['nota_final'] || ''}</td>
                </tr>
            `;
        });

        if (materiasOrdenadas.length === 0) {
            html += '<tr><td colspan="8" style="text-align: center;">No hay notas cargadas</td></tr>';
        }

        html += '</tbody></table></div>';

        // Mostrar en el modal
        document.getElementById('modalBody').innerHTML = html;
        document.getElementById('modalTitle').innerText = `Boletín de ${alumno.nombre}`;
        document.getElementById('modal').style.display = 'block';
    } catch (error) {
        console.error('Error al cargar boletín:', error);
        alert('No se pudo cargar el boletín');
    }
};

// ========== MODAL ==========
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');
closeModal.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };
// ========== CARGA DE NOTAS (formulario) ==========
document.getElementById('gradeCourse')?.addEventListener('change', function() {
    const courseId = this.value;
    const studentSelect = document.getElementById('gradeStudent');
    studentSelect.innerHTML = '<option value="">Seleccionar alumno</option>';
    if (!courseId) return;
    const alumnos = students.filter(s => s.id_curso == courseId);
    if (alumnos.length === 0) {
        studentSelect.innerHTML += '<option value="" disabled>No hay alumnos en este curso</option>';
    } else {
        alumnos.forEach(a => {
            studentSelect.innerHTML += `<option value="${a.id}">${a.nombre}</option>`;
        });
    }
});

document.getElementById('gradeForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id_usuario = parseInt(document.getElementById('gradeStudent').value);
    const id_materia = parseInt(document.getElementById('gradeSubject').value);
    const tipo_nota = document.getElementById('gradeTipo').value;
    const nota = parseFloat(document.getElementById('gradeValue').value);
    if (!id_usuario || !id_materia || !tipo_nota || isNaN(nota)) {
        alert('Complete todos los campos');
        return;
    }

    fetch(`${API_URL}/notas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario, id_materia, tipo_nota, nota })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) alert('Error: ' + data.error);
        else {
            alert(data.message);
            loadNotas();
            e.target.reset();
            // Reiniciar selects
            document.getElementById('gradeCourse').value = '';
            document.getElementById('gradeStudent').innerHTML = '<option value="">Seleccionar alumno</option>';
        }
    })
    .catch(err => {
        console.error(err);
        alert('Error de conexión');
    });
});

// ========== INICIALIZACIÓN ==========
loadCourses();
loadSubjects();
loadStudents();
loadNotas();