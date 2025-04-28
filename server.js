// Firmado y creado por Leonardo :)
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

const db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'tienda'
});

db.connect(err => {
    if (err)  throw err;
    console.log('Conectado a MySQL');
});

// Endpoint de login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT id, username FROM registrador WHERE username = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json({error: 'Error del servidor' });

        if (results.length > 0) {
            res.json({ 
                success: true, 
                userId: results[0].id,
                username: results[0].username
            });
        } else {
            res.json({ success: false });
        }
    });
});

// Obtener todos los usuarios
app.get('/usuarios', (req, res) => {
    const sql = 'SELECT u.id, u.nombre, u.correo, u.telefono, u.fecha_registro, r.username as registrador FROM usuarios u LEFT JOIN registrador r ON u.registrado_por = r.id';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.json(results);
    });
});


// Crear nuevo usuario
app.post('/usuarios', (req, res) => {
    const { nombre, correo, telefono, registrado_por } = req.body;
    const sql = 'INSERT INTO usuarios (nombre, correo, telefono, registrado_por) VALUES (?, ?, ?, ?)';
    db.query(sql, [nombre, correo, telefono, registrado_por], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al crear usuario' });
        res.json({ id: result.insertId, message: 'Usuario creado exitosamente' });
    });
});

// Actualizar usuario
app.put('/usuarios/:id', (req, res) => {
    const { nombre, correo, telefono } = req.body;
    const userId = req.params.id;
    const sql = 'UPDATE usuarios SET nombre = ?, correo = ?, telefono = ? WHERE id = ?';
    db.query(sql, [nombre, correo, telefono, userId], (err) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar usuario' });
        res.json({ message: 'Usuario actualizado exitosamente' });
    });
});

// Eliminar usuario
app.delete('/usuarios/:id', (req, res) => {
    const userId = req.params.id;
    const sql = 'DELETE FROM usuarios WHERE id = ?';
    db.query(sql, [userId], (err) => {
        if (err) return res.status(500).json({ error: 'Error al eliminar usuario' });
        res.json({ message: 'Usuario eliminado exitosamente' });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
