// ========== CONFIGURACIÓN ==========
const API_URL = 'http://localhost:5000/api';

// ========== DATOS LOCALES ==========
let subjects = [];
let courses = [];
let notasOriginales = [];   // todas las notas cargadas
let filteredNotas = [];     // notas filtradas por búsqueda
let users = [];
let solicitudes = [];
let filteredUsers = [];

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

        if (tabId === 'users') loadUsers();
        if (tabId === 'solicitudes') loadSolicitudes();
        if (tabId === 'subjects') loadSubjects();
        if (tabId === 'courses') loadCourses();
        if (tabId === 'grades') {
            loadCoursesSelect();
            loadSubjectsSelect();
            loadNotas();
        }
    });
});

// ========== FUNCIONES PARA USUARIOS ==========
async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/usuarios`);
        if (!response.ok) throw new Error('Error al cargar usuarios');
        users = await response.json();
        filteredUsers = [...users];
        renderUsers();
    } catch (error) {
        console.error(error);
        users = [];
        filteredUsers = [];
        renderUsers();
    }
}

function renderUsers() {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';
    filteredUsers.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.nombre}</td>
            <td>${user.dni || ''}</td>
            <td>${user.email}</td>
            <td>${user.rol}</td>
            <td>${user.curso_nombre || '-'}</td>
            <td>
                <button class="btn-sm" onclick="editUser(${user.id})">Editar</button>
                <button class="btn-sm btn-danger" onclick="deleteUser(${user.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Búsqueda de usuarios
document.getElementById('searchUser')?.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    if (searchTerm === '') {
        filteredUsers = [...users];
    } else {
        filteredUsers = users.filter(user => 
            user.nombre.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            (user.rol && user.rol.toLowerCase().includes(searchTerm)) ||
            (user.curso_nombre && user.curso_nombre.toLowerCase().includes(searchTerm))
        );
    }
    renderUsers();
});

// Abrir modal para nuevo usuario
document.getElementById('addUserBtn').addEventListener('click', () => {
    currentAction = 'addUser';
    modalTitle.innerText = 'Nuevo Usuario';
    
    let cursosOptions = '<option value="">Seleccionar curso</option>';
    courses.forEach(c => {
        cursosOptions += `<option value="${c.id}">${c.nombre || (c.año + '° ' + c.division)}</option>`;
    });

    const extra = document.getElementById('modalExtra');
    extra.style.display = 'block';
    extra.innerHTML = `
        <div class="form-group">
            <label>DNI</label>
            <input type="text" id="modalDni" required>
        </div>
        <div class="form-group">
            <label>Email</label>
            <input type="email" id="modalEmail" required>
        </div>
        <div class="form-group">
            <label>Contraseña</label>
            <input type="password" id="modalPassword" required>
        </div>
        <div class="form-group">
            <label>Rol</label>
            <select id="modalRol" required onchange="toggleCursoField()">
                <option value="">Seleccionar rol</option>
                <option value="admin">Administrador</option>
                <option value="alumnado">Alumnado</option>
                <option value="alumno">Alumno</option>
            </select>
        </div>
        <div class="form-group" id="modalCursoField" style="display:none;">
            <label>Curso</label>
            <select id="modalCurso">
                ${cursosOptions}
            </select>
        </div>
    `;
    modalInput.placeholder = 'Nombre completo';
    modalInput.value = '';
    modal.style.display = 'block';
});

window.toggleCursoField = function() {
    const rol = document.getElementById('modalRol')?.value;
    const cursoField = document.getElementById('modalCursoField');
    if (rol === 'alumno') {
        cursoField.style.display = 'block';
        document.getElementById('modalCurso').required = true;
    } else {
        cursoField.style.display = 'none';
        document.getElementById('modalCurso').required = false;
    }
};

window.editUser = (id) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    currentAction = 'editUser';
    currentId = id;
    modalTitle.innerText = 'Editar Usuario';
    modalInput.value = user.nombre;

    let cursosOptions = '<option value="">Seleccionar curso</option>';
    courses.forEach(c => {
        const selected = (user.id_curso == c.id) ? 'selected' : '';
        cursosOptions += `<option value="${c.id}" ${selected}>${c.nombre || (c.año + '° ' + c.division)}</option>`;
    });

    const extra = document.getElementById('modalExtra');
    extra.style.display = 'block';
    extra.innerHTML = `
    <div class="form-group">
        <label>DNI</label>
        <input type="text" id="modalDni" value="${user.dni || ''}" required>
    </div>
    <div class="form-group">
        <label>Email</label>
        <input type="email" id="modalEmail" value="${user.email}" required>
    </div>
    <div class="form-group">
        <label>Contraseña (dejar vacío para no cambiar)</label>
        <input type="password" id="modalPassword">
    </div>
    <div class="form-group">
        <label>Rol</label>
        <select id="modalRol" required onchange="toggleCursoField()">
            <option value="admin" ${user.rol === 'admin' ? 'selected' : ''}>Administrador</option>
            <option value="alumnado" ${user.rol === 'alumnado' ? 'selected' : ''}>Alumnado</option>
            <option value="alumno" ${user.rol === 'alumno' ? 'selected' : ''}>Alumno</option>
        </select>
    </div>
    <div class="form-group" id="modalCursoField" style="${user.rol === 'alumno' ? 'display:block' : 'display:none'}">
        <label>Curso</label>
        <select id="modalCurso">
            ${cursosOptions}
        </select>
    </div>
`;
    modal.style.display = 'block';
};

window.deleteUser = (id) => {
    if (!confirm('¿Eliminar usuario?')) return;
    fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if (data.error) alert('Error: ' + data.error);
            else {
                alert(data.message);
                loadUsers();
            }
        })
        .catch(err => {
            console.error(err);
            alert('Error de conexión');
        });
};

// ========== FUNCIONES PARA SOLICITUDES ==========
async function loadSolicitudes() {
    try {
        const response = await fetch(`${API_URL}/solicitudes`);
        if (!response.ok) throw new Error('Error al cargar solicitudes');
        solicitudes = await response.json();
        renderSolicitudes();
    } catch (error) {
        console.error(error);
        solicitudes = [];
        renderSolicitudes();
    }
}

function renderSolicitudes() {
    const tbody = document.querySelector('#solicitudesTable tbody');
    tbody.innerHTML = '';
    solicitudes.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${s.id}</td>
            <td>${s.nombre}</td>
            <td>${s.email}</td>
            <td>${s.dni}</td>
            <td>${s.rol}</td>
            <td>${new Date(s.fecha_solicitud).toLocaleDateString()}</td>
            <td>
                <button class="btn-sm" onclick="aprobarSolicitud(${s.id})">Aprobar</button>
                <button class="btn-sm btn-danger" onclick="rechazarSolicitud(${s.id})">Rechazar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.aprobarSolicitud = async (id) => {
    if (!confirm('¿Aprobar esta solicitud? Se creará el usuario.')) return;
    try {
        const response = await fetch(`${API_URL}/solicitudes/aprobar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            loadSolicitudes();
            loadUsers();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error de conexión');
    }
};

window.rechazarSolicitud = async (id) => {
    if (!confirm('¿Rechazar esta solicitud?')) return;
    try {
        const response = await fetch(`${API_URL}/solicitudes/rechazar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            loadSolicitudes();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error de conexión');
    }
};

// ========== FUNCIONES PARA MATERIAS ==========
async function loadSubjects() {
    try {
        const response = await fetch(`${API_URL}/materia`);
        if (!response.ok) throw new Error('Error al cargar materias');
        subjects = await response.json();
        renderSubjects();
    } catch (error) {
        console.error(error);
        subjects = [];
        renderSubjects();
    }
}

function renderSubjects() {
    const tbody = document.querySelector('#subjectsTable tbody');
    tbody.innerHTML = '';
    subjects.forEach(subj => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${subj.id}</td>
            <td>${subj.nombre}</td>
            <td>
                <button class="btn-sm" onclick="editSubject(${subj.id})">Editar</button>
                <button class="btn-sm btn-danger" onclick="deleteSubject(${subj.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('addSubjectBtn').addEventListener('click', () => {
    currentAction = 'addSubject';
    modalTitle.innerText = 'Nueva Materia';
    document.getElementById('modalExtra').style.display = 'none';
    modalInput.value = '';
    modalInput.placeholder = 'Nombre de la materia';
    modal.style.display = 'block';
});

window.editSubject = (id) => {
    const subj = subjects.find(s => s.id === id);
    if (!subj) return;
    currentAction = 'editSubject';
    currentId = id;
    modalTitle.innerText = 'Editar Materia';
    modalInput.value = subj.nombre;
    document.getElementById('modalExtra').style.display = 'none';
    modal.style.display = 'block';
};

window.deleteSubject = (id) => {
    if (!confirm('¿Eliminar materia?')) return;
    fetch(`${API_URL}/materia/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if (data.error) alert('Error: ' + data.error);
            else {
                alert(data.message);
                loadSubjects();
                loadSubjectsSelect();
            }
        })
        .catch(err => {
            console.error(err);
            alert('Error de conexión');
        });
};

// ========== FUNCIONES PARA CURSOS ==========
async function loadCourses() {
    try {
        const response = await fetch(`${API_URL}/curso`);
        if (!response.ok) throw new Error('Error al cargar cursos');
        courses = await response.json();
        renderCourses();
    } catch (error) {
        console.error(error);
        courses = [];
        renderCourses();
    }
}

function renderCourses() {
    const tbody = document.querySelector('#coursesTable tbody');
    tbody.innerHTML = '';
    courses.forEach(course => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${course.id}</td>
            <td>${course.nombre || (course.año + '° ' + course.division)}</td>
            <td>
                <button class="btn-sm" onclick="verAlumnos(${course.id})">Ver</button>
                <button class="btn-sm" onclick="editCourse(${course.id})">Editar</button>
                <button class="btn-sm btn-danger" onclick="deleteCourse(${course.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('addCourseBtn').addEventListener('click', () => {
    currentAction = 'addCourse';
    modalTitle.innerText = 'Nuevo Curso';
    const extra = document.getElementById('modalExtra');
    extra.style.display = 'block';
    extra.innerHTML = `
        <div class="form-group">
            <label>Año</label>
            <select id="modalAnio" required>
                <option value="">Seleccionar año</option>
                <option value="1">1°</option>
                <option value="2">2°</option>
                <option value="3">3°</option>
                <option value="4">4°</option>
                <option value="5">5°</option>
                <option value="6">6°</option>
                <option value="7">7°</option>
            </select>
        </div>
        <div class="form-group">
            <label>División</label>
            <select id="modalDivision" required>
                <option value="">Seleccionar división</option>
                <option value="1ra">1ra</option>
                <option value="2da">2da</option>
                <option value="3ra">3ra</option>
                <option value="4ta">4ta</option>
                <option value="5ta">5ta</option>
            </select>
        </div>
    `;
    modalInput.style.display = 'none';
    modalInput.required = false;
    modal.style.display = 'block';
});

window.editCourse = (id) => {
    const course = courses.find(c => c.id === id);
    if (!course) return;
    currentAction = 'editCourse';
    currentId = id;
    modalTitle.innerText = 'Editar Curso';
    const extra = document.getElementById('modalExtra');
    extra.style.display = 'block';
    extra.innerHTML = `
        <div class="form-group">
            <label>Año</label>
            <select id="modalAnio" required>
                <option value="">Seleccionar año</option>
                <option value="1" ${course.año == 1 ? 'selected' : ''}>1°</option>
                <option value="2" ${course.año == 2 ? 'selected' : ''}>2°</option>
                <option value="3" ${course.año == 3 ? 'selected' : ''}>3°</option>
                <option value="4" ${course.año == 4 ? 'selected' : ''}>4°</option>
                <option value="5" ${course.año == 5 ? 'selected' : ''}>5°</option>
                <option value="6" ${course.año == 6 ? 'selected' : ''}>6°</option>
                <option value="7" ${course.año == 7 ? 'selected' : ''}>7°</option>
            </select>
        </div>
        <div class="form-group">
            <label>División</label>
            <select id="modalDivision" required>
                <option value="">Seleccionar división</option>
                <option value="1ra" ${course.division === '1ra' ? 'selected' : ''}>1ra</option>
                <option value="2da" ${course.division === '2da' ? 'selected' : ''}>2da</option>
                <option value="3ra" ${course.division === '3ra' ? 'selected' : ''}>3ra</option>
                <option value="4ta" ${course.division === '4ta' ? 'selected' : ''}>4ta</option>
                <option value="5ta" ${course.division === '5ta' ? 'selected' : ''}>5ta</option>
            </select>
        </div>
    `;
    modalInput.style.display = 'none';
    modalInput.required = false;
    modal.style.display = 'block';
};

window.deleteCourse = (id) => {
    if (!confirm('¿Eliminar curso?')) return;
    fetch(`${API_URL}/curso/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if (data.error) alert('Error: ' + data.error);
            else {
                alert(data.message);
                loadCourses();
                loadCoursesSelect();
            }
        })
        .catch(err => {
            console.error(err);
            alert('Error de conexión');
        });
};

// ========== FUNCIONES PARA NOTAS ==========
async function loadNotas() {
    try {
        const response = await fetch(`${API_URL}/notas`);
        if (!response.ok) throw new Error('Error al cargar notas');
        notasOriginales = await response.json();
        // Aplicar filtro si hay término de búsqueda
        filtrarNotas();
    } catch (error) {
        console.error(error);
        notasOriginales = [];
        filteredNotas = [];
        renderNotas();
    }
}

let searchTermNotas = ''; // término de búsqueda actual

function filtrarNotas() {
    if (!searchTermNotas) {
        filteredNotas = [...notasOriginales];
    } else {
        const term = searchTermNotas.toLowerCase();
        filteredNotas = notasOriginales.filter(n => 
            n.alumno_nombre.toLowerCase().includes(term)
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
            <td>${nota.alumno_dni || ''}</td>
            <td>${nota.alumno_email || ''}</td>
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

// Búsqueda en notas
document.getElementById('searchNotas')?.addEventListener('input', function(e) {
    searchTermNotas = e.target.value;
    filtrarNotas();
});

window.deleteNota = (id) => {
    if (!confirm('¿Eliminar nota?')) return;
    fetch(`${API_URL}/notas/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if (data.error) alert('Error: ' + data.error);
            else {
                alert(data.message);
                loadNotas(); // recarga y aplica filtro si existe
            }
        })
        .catch(err => {
            console.error(err);
            alert('Error de conexión');
        });
};

// Selects para notas
function loadCoursesSelect() {
    const select = document.getElementById('gradeCourse');
    if (!select) return;
    select.innerHTML = '<option value="">Seleccionar curso</option>';
    courses.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.nombre || (c.año + '° ' + c.division)}</option>`;
    });
}

function loadSubjectsSelect() {
    const select = document.getElementById('gradeSubject');
    if (!select) return;
    select.innerHTML = '<option value="">Seleccionar materia</option>';
    subjects.forEach(s => {
        select.innerHTML += `<option value="${s.id}">${s.nombre}</option>`;
    });
}

document.getElementById('gradeCourse')?.addEventListener('change', function() {
    const courseId = this.value;
    const studentSelect = document.getElementById('gradeStudent');
    studentSelect.innerHTML = '<option value="">Seleccionar alumno</option>';
    if (!courseId) return;
    const alumnos = users.filter(u => u.rol === 'alumno' && u.id_curso == courseId);
    if (alumnos.length === 0) {
        studentSelect.innerHTML += '<option value="" disabled>No hay alumnos en este curso</option>';
    } else {
        alumnos.forEach(a => {
            const opcion = document.createElement('option');
            opcion.value = a.id;
            opcion.textContent = `${a.nombre} (DNI: ${a.dni || 'N/A'}) - ${a.email}`;
            studentSelect.appendChild(opcion);
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
        }
    })
    .catch(err => {
        console.error(err);
        alert('Error de conexión');
    });
});

// ========== MODAL GENÉRICO ==========
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalInput = document.getElementById('modalInput');
const modalForm = document.getElementById('modalForm');
const modalExtra = document.getElementById('modalExtra');
const closeModal = document.querySelector('.close');
let currentAction = null;
let currentId = null;

closeModal.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

modalForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Caso: CURSOS (con año y división)
    if (currentAction === 'addCourse' || currentAction === 'editCourse') {
        const anio = document.getElementById('modalAnio').value;
        const division = document.getElementById('modalDivision').value;
        if (!anio || !division) {
            alert('Debe seleccionar año y división');
            return;
        }

        if (currentAction === 'addCourse') {
            fetch(`${API_URL}/curso`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ año: parseInt(anio), division })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) alert('Error: ' + data.error);
                else {
                    alert(data.message);
                    loadCourses();
                    loadCoursesSelect();
                }
            })
            .catch(err => {
                console.error(err);
                alert('Error de conexión');
            });
        } else {
            fetch(`${API_URL}/curso/${currentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ año: parseInt(anio), division })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) alert('Error: ' + data.error);
                else {
                    alert(data.message);
                    loadCourses();
                    loadCoursesSelect();
                }
            })
            .catch(err => {
                console.error(err);
                alert('Error de conexión');
            });
        }

        modal.style.display = 'none';
        modalForm.reset();
        modalExtra.innerHTML = '';
        modalInput.style.display = 'block';
        modalInput.required = true;
        return;
    }

    // Caso: USUARIOS (con DNI y curso)
    if (currentAction === 'addUser' || currentAction === 'editUser') {
        const name = modalInput.value.trim();
        if (!name) return;

        const dni = document.getElementById('modalDni').value.trim().replace(/\./g, '');
        const email = document.getElementById('modalEmail').value;
        const rol = document.getElementById('modalRol').value;
        const pass = document.getElementById('modalPassword').value;
        let id_curso = null;

        if (!dni || !email || !rol) {
            alert('Complete todos los campos obligatorios');
            return;
        }

        if (rol === 'alumno') {
            id_curso = document.getElementById('modalCurso').value;
            if (!id_curso) {
                alert('Debe seleccionar un curso para el alumno');
                return;
            }
        }

        const url = currentAction === 'addUser' ? `${API_URL}/usuarios` : `${API_URL}/usuarios/${currentId}`;
        const method = currentAction === 'addUser' ? 'POST' : 'PUT';

        const body = { nombre: name, dni, email, password: pass, rol, id_curso };

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) alert('Error: ' + data.error);
            else {
                alert(data.message);
                loadUsers();
            }
        })
        .catch(err => {
            console.error(err);
            alert('Error de conexión');
        });

        modal.style.display = 'none';
        modalForm.reset();
        modalExtra.innerHTML = '';
        return;
    }

    // Caso: MATERIAS
    if (currentAction === 'addSubject' || currentAction === 'editSubject') {
        const name = modalInput.value.trim();
        if (!name) return;

        if (currentAction === 'addSubject') {
            fetch(`${API_URL}/materia`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: name })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) alert('Error: ' + data.error);
                else {
                    alert(data.message);
                    loadSubjects();
                    loadSubjectsSelect();
                }
            })
            .catch(err => {
                console.error(err);
                alert('Error de conexión');
            });
        } else {
            fetch(`${API_URL}/materia/${currentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: name })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) alert('Error: ' + data.error);
                else {
                    alert(data.message);
                    loadSubjects();
                    loadSubjectsSelect();
                }
            })
            .catch(err => {
                console.error(err);
                alert('Error de conexión');
            });
        }

        modal.style.display = 'none';
        modalForm.reset();
        modalExtra.innerHTML = '';
        return;
    }

    // Si no coincide, cerrar modal
    modal.style.display = 'none';
    modalForm.reset();
    modalExtra.innerHTML = '';
});

// ========== FUNCIÓN PARA VER ALUMNOS POR CURSO ==========
window.verAlumnos = (cursoId) => {
    const curso = courses.find(c => c.id === cursoId);
    const cursoNombre = curso ? (curso.nombre || (curso.año + '° ' + curso.division)) : 'Desconocido';
    
    const alumnos = users.filter(u => u.rol === 'alumno' && u.id_curso == cursoId);
    
    let contenido = `<h3 style="margin-bottom: 15px;">Alumnos de ${cursoNombre}</h3>`;
    if (alumnos.length === 0) {
        contenido += '<p style="color: #666;">No hay alumnos inscriptos en este curso.</p>';
    } else {
        contenido += '<ul style="list-style: none; padding: 0; max-height: 300px; overflow-y: auto;">';
        alumnos.forEach(alumno => {
            contenido += `<li style="padding: 8px 12px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 8px;">
                <span style="background: #8B0000; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">${alumno.nombre.charAt(0)}</span>
                <span><strong>${alumno.nombre}</strong><br><small>${alumno.email}</small></span>
            </li>`;
        });
        contenido += '</ul>';
    }
    
    const extraStyle = modalExtra.style.display;
    const inputStyle = modalInput.style.display;
    const submitBtn = modalForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.style.display = 'none';
    
    modalTitle.innerText = 'Alumnos del Curso';
    modalExtra.style.display = 'block';
    modalInput.style.display = 'none';
    modalExtra.innerHTML = contenido;
    modal.style.display = 'block';
    
    const cerrar = () => {
        modal.style.display = 'none';
        modalExtra.innerHTML = '';
        modalExtra.style.display = extraStyle;
        modalInput.style.display = inputStyle;
        if (submitBtn) submitBtn.style.display = 'block';
    };
    
    closeModal.onclick = cerrar;
    window.onclick = (e) => {
        if (e.target == modal) cerrar();
    };
};

// ========== INICIALIZACIÓN ==========
loadUsers();
loadSubjects();
loadCourses();
loadCoursesSelect();
loadSubjectsSelect();
loadNotas();