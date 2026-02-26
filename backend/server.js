const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

// Configuración de la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'boletindigital'
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Error al conectar con la base de datos:', err.stack);
        return;
    }
    console.log('✅ Conectado a la base de datos');
});

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Bienvenido al Boletín Digital');
});

// ========== MAPEO DE ROLES ==========
// Convierte el rol que envía el frontend al valor que espera la base de datos
function mapRolToDB(rolFrontend) {
    const mapa = {
        'admin': 'administrador',
        'alumnado': 'alumnado',
        'alumno': 'estudiante'
    };
    return mapa[rolFrontend] || 'estudiante';
}

// Convierte el rol de la base de datos al que entiende el frontend
function mapRolFromDB(rolDB) {
    const mapa = {
        'administrador': 'admin',
        'alumnado': 'alumnado',
        'estudiante': 'alumno'
    };
    return mapa[rolDB] || 'alumno';
}

// ========== REGISTRO DE USUARIO (CON ID_CURSO PARA ALUMNOS) ==========
app.post('/api/register', async (req, res) => {
    const { nombre, dni, email, password, rol, id_curso } = req.body;
    console.log('Registro recibido:', { nombre, dni, email, rol, id_curso });

    if (!nombre || !dni || !email || !password || !rol) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Verificar email duplicado en usuarios
        const [existingUser] = await connection.promise().query(
            'SELECT id_usuario FROM usuario WHERE email = ?', [email]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Verificar email duplicado en solicitudes pendientes
        const [existingSolicitud] = await connection.promise().query(
            'SELECT id FROM solicitudes WHERE email = ?', [email]
        );
        if (existingSolicitud.length > 0) {
            return res.status(400).json({ error: 'Ya existe una solicitud pendiente para este correo' });
        }
        // Verificar si el DNI ya existe en usuarios
        const [existingDni] = await connection.promise().query(
            'SELECT id_usuario FROM usuario WHERE dni = ?', [parseInt(dni)]
        );
        if (existingDni.length > 0) {
            return res.status(400).json({ error: 'El DNI ya está registrado' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        if (rol === 'alumno') {
            // Insertar alumno directamente
            await connection.promise().query(
                'INSERT INTO usuario (nombre, dni, email, contraseña, rol, id_curso) VALUES (?, ?, ?, ?, ?, ?)',
                [nombre, parseInt(dni), email, hashedPassword, 'estudiante', id_curso || null]
            );
            return res.status(201).json({ message: '✅ Registro exitoso' });
        } else {
            // Insertar solicitud para admin o alumnado
            const rolDB = rol === 'admin' ? 'administrador' : 'alumnado';
            await connection.promise().query(
                'INSERT INTO solicitudes (nombre, dni, email, contraseña, rol) VALUES (?, ?, ?, ?, ?)',
                [nombre, parseInt(dni), email, hashedPassword, rolDB]
            );
            return res.status(201).json({ message: '✅ Solicitud enviada. Espera la aprobación del administrador.' });
        }
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========== INICIO DE SESIÓN ==========
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    try {
        const [rows] = await connection.promise().query(
            'SELECT id_usuario, nombre, dni, email, contraseña, rol, id_curso FROM usuario WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.contraseña);
        if (!match) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        // Obtener el nombre del curso si el alumno tiene curso asignado
        let curso_nombre = '';
        if (user.id_curso) {
            const [cursoRow] = await connection.promise().query(
                'SELECT CONCAT(año, "° ", division) as nombre FROM curso WHERE id_curso = ?',
                [user.id_curso]
            );
            curso_nombre = cursoRow.length ? cursoRow[0].nombre : '';
        }

        const rolFrontend = mapRolFromDB(user.rol);

        res.json({
            message: '✅ Inicio de sesión exitoso',
            user: {
                id: user.id_usuario,
                nombre: user.nombre,
                dni: user.dni,
                email: user.email,
                rol: rolFrontend,
                id_curso: user.id_curso,
                curso_nombre: curso_nombre
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========== OBTENER TODOS LOS USUARIOS (para el admin) ==========
app.get('/api/usuarios', async (req, res) => {
    try {
        const [rows] = await connection.promise().query(
            `SELECT u.id_usuario as id, u.nombre, u.dni, u.email, u.rol, u.id_curso,
                    CONCAT(c.año, '° ', c.division) as curso_nombre
             FROM usuario u
             LEFT JOIN curso c ON u.id_curso = c.id_curso`
        );
        const usuarios = rows.map(u => ({
            ...u,
            rol: mapRolFromDB(u.rol)
        }));
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// ========== CREAR USUARIO (admin) ==========
app.post('/api/usuarios', async (req, res) => {
    const { nombre, dni, email, password, rol, id_curso } = req.body;
    if (!nombre || !dni || !email || !password || !rol) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    try {
        // Verificar email duplicado
        const [existing] = await connection.promise().query(
            'SELECT id_usuario FROM usuario WHERE email = ?', [email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const rolDB = mapRolToDB(rol);
        const [result] = await connection.promise().query(
            'INSERT INTO usuario (nombre, dni, email, contraseña, rol, id_curso) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, parseInt(dni), email, hashedPassword, rolDB, id_curso || null]
        );
        res.status(201).json({ message: '✅ Usuario creado', userId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// ========== EDITAR USUARIO ==========
app.put('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, dni, email, password, rol, id_curso } = req.body;
    if (!nombre || !dni || !email || !rol) {
        return res.status(400).json({ error: 'Nombre, DNI, email y rol son obligatorios' });
    }
    try {
        // Verificar email duplicado en otro usuario
        const [existing] = await connection.promise().query(
            'SELECT id_usuario FROM usuario WHERE email = ? AND id_usuario != ?', [email, id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado por otro usuario' });
        }
        let query = 'UPDATE usuario SET nombre = ?, dni = ?, email = ?, rol = ?, id_curso = ?';
        const params = [nombre, parseInt(dni), email, mapRolToDB(rol), id_curso || null];
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', contraseña = ?';
            params.push(hashedPassword);
        }
        query += ' WHERE id_usuario = ?';
        params.push(id);
        await connection.promise().query(query, params);
        res.json({ message: '✅ Usuario actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// ========== ELIMINAR USUARIO ==========
app.delete('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await connection.promise().query('DELETE FROM usuario WHERE id_usuario = ?', [id]);
        res.json({ message: '✅ Usuario eliminado' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========== OBTENER SOLICITUDES PENDIENTES ==========
app.get('/api/solicitudes', async (req, res) => {
    try {
        const [rows] = await connection.promise().query(
            'SELECT * FROM solicitudes WHERE estado = "pendiente" ORDER BY fecha_solicitud DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        res.status(500).json({ error: 'Error al obtener solicitudes' });
    }
});

// ========== APROBAR SOLICITUD ==========
app.post('/api/solicitudes/aprobar', async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID requerido' });

    try {
        const [rows] = await connection.promise().query(
            'SELECT * FROM solicitudes WHERE id = ? AND estado = "pendiente"', [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }
        const solicitud = rows[0];

        // Insertar en usuarios (sin curso, luego el admin lo asignará)
        await connection.promise().query(
            'INSERT INTO usuario (nombre, dni, email, contraseña, rol, id_curso) VALUES (?, ?, ?, ?, ?, ?)',
            [solicitud.nombre, solicitud.dni, solicitud.email, solicitud.contraseña, solicitud.rol, null]
        );

        await connection.promise().query(
            'UPDATE solicitudes SET estado = "aprobada" WHERE id = ?', [id]
        );

        res.json({ message: '✅ Solicitud aprobada, usuario creado' });
    } catch (error) {
        console.error('Error al aprobar solicitud:', error);
        res.status(500).json({ error: 'Error al aprobar solicitud' });
    }
});

// ========== RECHAZAR SOLICITUD ==========
app.post('/api/solicitudes/rechazar', async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID requerido' });

    try {
        await connection.promise().query(
            'UPDATE solicitudes SET estado = "rechazada" WHERE id = ?', [id]
        );
        res.json({ message: '✅ Solicitud rechazada' });
    } catch (error) {
        console.error('Error al rechazar solicitud:', error);
        res.status(500).json({ error: 'Error al rechazar solicitud' });
    }
});

// ========== OBTENER TODAS LAS MATERIAS ==========
app.get('/api/materia', async (req, res) => {
    try {
        const [rows] = await connection.promise().query('SELECT id_materia AS id, nombre FROM materia ORDER BY id_materia');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener materias:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========== CREAR NUEVA MATERIA ==========
app.post('/api/materia', async (req, res) => {
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la materia es obligatorio' });
    }

    try {
        const [result] = await connection.promise().query(
            'INSERT INTO materia (nombre) VALUES (?)',
            [nombre]
        );
        res.status(201).json({
            message: '✅ Materia creada correctamente',
            id: result.insertId,
            nombre
        });
    } catch (error) {
        console.error('Error al crear materia:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Ya existe una materia con ese nombre' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========== EDITAR MATERIA ==========
app.put('/api/materia/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la materia es obligatorio' });
    }

    try {
        const [result] = await connection.promise().query(
            'UPDATE materia SET nombre = ? WHERE id_materia = ?',
            [nombre, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Materia no encontrada' });
        }
        res.json({ message: '✅ Materia actualizada', id, nombre });
    } catch (error) {
        console.error('Error al editar materia:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Ya existe una materia con ese nombre' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========== ELIMINAR MATERIA ==========
app.delete('/api/materia/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await connection.promise().query(
            'DELETE FROM materia WHERE id_materia = ?',
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Materia no encontrada' });
        }
        res.json({ message: '✅ Materia eliminada' });
    } catch (error) {
        console.error('Error al eliminar materia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========== OBTENER TODOS LOS CURSOS ==========
app.get('/api/curso', async (req, res) => {
    try {
        const [rows] = await connection.promise().query(
            'SELECT id_curso AS id, año, division FROM curso ORDER BY id_curso'
        );
        const cursos = rows.map(c => ({
            id: c.id,
            año: c.año,
            division: c.division,
            nombre: `${c.año}° ${c.division}`
        }));
        res.json(cursos);
    } catch (error) {
        console.error('Error al obtener cursos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========== CREAR NUEVO CURSO ==========
app.post('/api/curso', async (req, res) => {
    const { año, division } = req.body;
    if (!año || !division) {
        return res.status(400).json({ error: 'Año y división son obligatorios' });
    }

    try {
        const [result] = await connection.promise().query(
            'INSERT INTO curso (año, division) VALUES (?, ?)',
            [año, division]
        );
        res.status(201).json({
            message: '✅ Curso creado correctamente',
            id: result.insertId,
            año,
            division,
            nombre: `${año}° ${division}`
        });
    } catch (error) {
        console.error('Error al crear curso:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Ya existe un curso con esos datos' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========== EDITAR CURSO ==========
app.put('/api/curso/:id', async (req, res) => {
    const { id } = req.params;
    const { año, division } = req.body;
    if (!año || !division) {
        return res.status(400).json({ error: 'Año y división son obligatorios' });
    }

    try {
        const [result] = await connection.promise().query(
            'UPDATE curso SET año = ?, division = ? WHERE id_curso = ?',
            [año, division, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }
        res.json({
            message: '✅ Curso actualizado',
            id,
            año,
            division,
            nombre: `${año}° ${division}`
        });
    } catch (error) {
        console.error('Error al editar curso:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Ya existe un curso con esos datos' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========== ELIMINAR CURSO ==========
app.delete('/api/curso/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await connection.promise().query(
            'DELETE FROM curso WHERE id_curso = ?',
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }
        res.json({ message: '✅ Curso eliminado' });
    } catch (error) {
        console.error('Error al eliminar curso:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========== OBTENER NOTAS ==========
app.get('/api/notas', async (req, res) => {
    try {
        const [rows] = await connection.promise().query(
            `SELECT n.id_nota, n.id_usuario, n.id_materia, n.tipo_nota, n.nota, n.fecha,
                    u.nombre as alumno_nombre, u.dni as alumno_dni, u.email as alumno_email,
                    m.nombre as materia_nombre
             FROM nota n
             JOIN usuario u ON n.id_usuario = u.id_usuario
             JOIN materia m ON n.id_materia = m.id_materia
             ORDER BY n.fecha DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener notas:', error);
        res.status(500).json({ error: 'Error al obtener notas' });
    }
});

// ========== CREAR O ACTUALIZAR NOTA ==========
app.post('/api/notas', async (req, res) => {
    const { id_usuario, id_materia, tipo_nota, nota } = req.body;
    if (!id_usuario || !id_materia || !tipo_nota || nota === undefined) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const [result] = await connection.promise().query(
            `INSERT INTO nota (id_usuario, id_materia, tipo_nota, nota)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE nota = VALUES(nota)`,
            [id_usuario, id_materia, tipo_nota, nota]
        );

        let message = '';
        if (result.affectedRows === 1) {
            message = '✅ Nota guardada';
        } else if (result.affectedRows === 2) {
            message = '✅ Nota actualizada';
        }

        res.status(201).json({ message, id: result.insertId });
    } catch (error) {
        console.error('Error al guardar nota:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========== ELIMINAR NOTA ==========
app.delete('/api/notas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await connection.promise().query('DELETE FROM nota WHERE id_nota = ?', [id]);
        res.json({ message: '✅ Nota eliminada' });
    } catch (error) {
        console.error('Error al eliminar nota:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========== OBTENER BOLETÍN DE UN ALUMNO (TODAS LAS MATERIAS) ==========
app.get('/api/boletin/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const [rows] = await connection.promise().query(
            `SELECT m.id_materia, m.nombre AS materia_nombre, n.tipo_nota, n.nota
             FROM materia m
             LEFT JOIN nota n ON m.id_materia = n.id_materia AND n.id_usuario = ?
             ORDER BY m.id_materia`,
            [id_usuario]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener boletín:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});
// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});