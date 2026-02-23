// Elementos del DOM
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const heroLoginBtn = document.getElementById('heroLoginBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeButtons = document.querySelectorAll('.close');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const adminDashboard = document.getElementById('adminDashboard');
const alumnadoDashboard = document.getElementById('alumnadoDashboard');
const alumnoDashboard = document.getElementById('alumnoDashboard');
const logoutBtns = document.querySelectorAll('[id^="logoutBtn"]');
const dashboardTabs = document.querySelectorAll('.dashboard-tab');

// Abrir modal de login
function openLoginModal() {
    loginModal.style.display = 'block';
    registerModal.style.display = 'none';
}

// Abrir modal de registro
function openRegisterModal() {
    registerModal.style.display = 'block';
    loginModal.style.display = 'none';
}

// Cerrar modales
function closeModals() {
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
}

// Cambiar entre pestañas del dashboard
function switchTab(tabId) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar la pestaña seleccionada
    document.getElementById(tabId).classList.add('active');
}

// Cerrar sesión
function logout() {
    // Ocultar todos los dashboards
    document.querySelectorAll('.dashboard').forEach(dashboard => {
        dashboard.style.display = 'none';
    });
    
    // Mostrar la página principal
    document.querySelector('header').style.display = 'block';
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'block';
    });
    document.querySelector('footer').style.display = 'block';
}

// Event Listeners
loginBtn.addEventListener('click', openLoginModal);
registerBtn.addEventListener('click', openRegisterModal);
heroLoginBtn.addEventListener('click', openLoginModal);

closeButtons.forEach(button => {
    button.addEventListener('click', closeModals);
});

switchToRegister.addEventListener('click', openRegisterModal);
switchToLogin.addEventListener('click', openLoginModal);

// Cerrar modal al hacer clic fuera de él
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        closeModals();
    }
    if (e.target === registerModal) {
        closeModals();
    }
});

// Manejo del formulario de login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const userType = document.getElementById('userType').value;
    
    // Validación básica
    if (!email || !password || !userType) {
        alert('Por favor, complete todos los campos');
        return;
    }
    
    // Simulación de inicio de sesión
    closeModals();
    
    // Ocultar la página principal
    document.querySelector('header').style.display = 'none';
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    document.querySelector('footer').style.display = 'none';
    
    // Mostrar el dashboard correspondiente
    if (userType === 'admin') {
        adminDashboard.style.display = 'block';
    } else if (userType === 'alumnado') {
        alumnadoDashboard.style.display = 'block';
    } else if (userType === 'alumno') {
        alumnoDashboard.style.display = 'block';
    }
});

// Manejo del formulario de registro
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const userType = document.getElementById('registerUserType').value;
    
    // Validación básica
    if (!name || !email || !password || !userType) {
        alert('Por favor, complete todos los campos');
        return;
    }
    
    // Simulación de registro exitoso
    alert('Registro exitoso. Ahora puede iniciar sesión.');
    openLoginModal();
});

// Event listeners para las pestañas del dashboard
dashboardTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = e.target.getAttribute('data-tab') + 'Tab';
        switchTab(tabId);
    });
});

// Event listeners para cerrar sesión
logoutBtns.forEach(btn => {
    btn.addEventListener('click', logout);
});

// Manejo del formulario de carga de calificaciones
const gradeForm = document.getElementById('gradeForm');
if (gradeForm) {
    gradeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const student = document.getElementById('studentSelect').value;
        const subject = document.getElementById('subject').value;
        const grade = document.getElementById('grade').value;
        
        if (!student || !subject || !grade) {
            alert('Por favor, complete todos los campos');
            return;
        }
        
        alert('Calificación cargada exitosamente');
        gradeForm.reset();
    });
}
// Agregar al final de main.js

// Manejo del formulario de contacto
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.');
        contactForm.reset();
    });
}

// Funcionalidad de búsqueda en tablas
function addSearchFunctionality() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        const headerRow = table.querySelector('thead tr');
        if (headerRow) {
            // Agregar campo de búsqueda si no existe
            if (!table.previousElementSibling || !table.previousElementSibling.classList.contains('table-search')) {
                const searchDiv = document.createElement('div');
                searchDiv.className = 'table-search';
                searchDiv.innerHTML = `
                    <input type="text" placeholder="Buscar..." class="search-input">
                `;
                table.parentNode.insertBefore(searchDiv, table);
                
                const searchInput = searchDiv.querySelector('.search-input');
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const rows = table.querySelectorAll('tbody tr');
                    
                    rows.forEach(row => {
                        const text = row.textContent.toLowerCase();
                        row.style.display = text.includes(searchTerm) ? '' : 'none';
                    });
                });
            }
        }
    });
}

// Inicializar búsqueda cuando se cargan los dashboards
document.addEventListener('DOMContentLoaded', function() {
    // Observar cambios en la visibilidad de los dashboards
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;
                if (target.classList.contains('dashboard') && target.style.display === 'block') {
                    setTimeout(addSearchFunctionality, 100);
                }
            }
        });
    });
    
    // Observar todos los dashboards
    document.querySelectorAll('.dashboard').forEach(dashboard => {
        observer.observe(dashboard, { attributes: true });
    });
});

// Funcionalidad de exportación de datos
function initializeExportButtons() {
    const exportButtons = document.querySelectorAll('.export-btn');
    exportButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const table = this.closest('.tab-content').querySelector('table');
            if (table) {
                exportTableToCSV(table, 'datos_exportados.csv');
            }
        });
    });
}

function exportTableToCSV(table, filename) {
    const rows = table.querySelectorAll('tr');
    const csv = [];
    
    for (let i = 0; i < rows.length; i++) {
        const row = [], cols = rows[i].querySelectorAll('td, th');
        
        for (let j = 0; j < cols.length; j++) {
            // Eliminar botones de las celdas
            const text = cols[j].textContent.replace(/Editar|Eliminar/g, '').trim();
            row.push(text);
        }
        
        csv.push(row.join(','));
    }
    
    // Descargar archivo
    const csvFile = new Blob([csv.join('\n')], { type: 'text/csv' });
    const downloadLink = document.createElement('a');
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    alert('Datos exportados correctamente');
}

// CSS adicional para las nuevas funcionalidades
const additionalCSS = `
.table-search {
    margin-bottom: 1rem;
}

.search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #D32F2F;
    border-radius: 5px;
    font-size: 1rem;
}

.export-btn {
    background-color: #27ae60;
    margin-left: 10px;
}

.export-btn:hover {
    background-color: #219653;
}

/* Mejoras visuales adicionales */
.loading {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #D32F2F;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;

// Injectar CSS adicional
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);