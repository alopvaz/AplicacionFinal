// Importar el módulo que contiene la conexión a la base de datos
import con from '../database.js'; 

// Importar express para crear el router
import express from 'express';

// Creamos el router para definir rutas y luego exportarlo al index.js
var router = express.Router();

// Ruta de inicio de sesión: cuando se hace una solicitud POST a '/login' se ejecuta la función
router.post('/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password

    // Primero, buscamos al usuario en la base de datos sin verificar la contraseña
    con.query('SELECT * FROM participantes WHERE usuario = ?', [username], function(err, result) {
        if (err) throw err;

        // Si no encontramos ningún usuario que coincida con el nombre de usuario
        if (result.length === 0) {
            // Enviamos una respuesta con el estado 'UserNotFound' y un mensaje de error
            res.json({ status: 'UserNotFound', message: 'No encontramos ninguna cuenta con ese nombre de usuario.' });
        } else {
            // Si encontramos un usuario, verificamos la contraseña
            if (result[0].contrasena === password) {
                // Si la contraseña es correcta, iniciamos la sesión
                req.session.role = result[0].rol;
                req.session.name = result[0].nombre;
                req.session.userId = result[0].id;
                console.log("Se ha conectado el usuario " + req.session.name + " con el rol " + req.session.role + " y el ID " + req.session.userId);
                res.json({ status: 'OK' });
            } else {
                // Si la contraseña no es correcta, enviamos una respuesta con el estado 'IncorrectPassword' y un mensaje de error
                res.json({ status: 'IncorrectPassword', message: 'La contraseña no es correcta.' });
            }
        }
    });
});

// Ruta que responde con el rol del usuario que ha iniciado sesión
router.get('/role', function(req, res) {
    if (req.session.role) {
        res.send(req.session.role) // Envía el rol del usuario
    } else {
        res.status(401).send('No autorizado')
    }
});

// Ruta que responde con el nombre del usuario que ha iniciado sesión
router.get('/name', function(req, res) {
    if (req.session.name) {
        res.send(req.session.name) // Envía el nombre del usuario
    } else {
        res.status(401).send('No autorizado')
    }
});

// Ruta que responde con el ID del usuario que ha iniciado sesión
router.get('/userId', function(req, res) {
    if (req.session.userId) {
        res.send(req.session.userId.toString()) // Envía el ID del usuario
    } else {
        res.status(401).send('No autorizado')
    }
});

// Exportamos el router para usarlo en otros archivos
export default router;