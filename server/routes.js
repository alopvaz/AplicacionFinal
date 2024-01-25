
import con from './database.js'; // Importamos la conexión a la base de datos para hacer consultas dentro de cada ruta
import express from 'express'; //importamos express para crear el router
var router = express.Router(); // Creamos el router para definir rutas y luego exportarlo al index.js

router.post('/crear-sesion', function(req, res) {
    var nombreSesion = req.body.nombreSesion;
    var fechaHora = new Date();
    fechaHora.setHours(fechaHora.getHours() + 1); // Ajusta la hora a tu zona horaria
    fechaHora = fechaHora.toISOString();
  
    con.query('INSERT INTO sesiones (nombre, fecha) VALUES (?, ?)', [nombreSesion, fechaHora], function(err, result) {
      if (err) throw err;
      res.send({ message: 'Sesión creada con éxito', sessionId: result.insertId }); // Devuelve el ID de la sesión recién creada
    });
  });

  router.post('/crear-tarea', (req, res) => {
    const { nombre, estimacion, sesionId } = req.body;
    const query = `INSERT INTO tareas (nombre, estimacion, sesion) VALUES (?, ?, ?)`;
    con.query(query, [nombre, estimacion, sesionId], (err, result) => {
      if (err) {
        res.status(500).send('Error al crear la tarea');
      } else {
        // Devuelve el id de la tarea recién creada
        res.status(200).json({ message: 'Tarea creada con éxito', tareaId: result.insertId });
      }
    });
  });

  router.get('/sesiones', function(req, res) {
    con.query('SELECT * FROM sesiones', function(err, result) {
        if (err) throw err;
        res.json(result);
    });
});

router.delete('/sesiones/:id', function(req, res) {
    var id = req.params.id;
  
    // Primero, elimina todas las tareas que hacen referencia a la sesión
    con.query('DELETE FROM tareas WHERE sesion = ?', [id], function(err, result) {
        if (err) throw err;

        // Luego, elimina la sesión
        con.query('DELETE FROM sesiones WHERE id = ?', [id], function(err, result) {
            if (err) throw err;
            res.send({ message: 'Sesión eliminada con éxito' });
        });
    });
});

router.get('/tareas/:id', function(req, res) {
    var id = req.params.id;
    con.query('SELECT * FROM tareas WHERE sesion = ?', [id], function(err, result) {
        if (err) throw err;
        res.json(result);
    });
});

router.delete('/tareas/:id', function(req, res) {
    var id = req.params.id;
  
    // Elimina la tarea
    con.query('DELETE FROM tareas WHERE id = ?', [id], function(err, result) {
        if (err) throw err;
        res.send({ message: 'Tarea eliminada con éxito' });
    });
});

  
router.post('/guardar-votacion', (req, res) => {
    const { usuarioId, tareaId, votacion } = req.body;
    const query = `INSERT INTO votaciones (id_participante, id_tarea, votacion) VALUES (?, ?, ?)`;
    con.query(query, [usuarioId, tareaId, votacion], (err, result) => {
      if (err) {
        res.status(500).send('Error al guardar la votación');
      } else {
        res.status(200).send('Votación guardada con éxito');
      }
    });
});

router.get('/votaciones/:id', function(req, res) {
    var id = req.params.id;
    con.query('SELECT participantes.nombre, votaciones.votacion FROM votaciones INNER JOIN participantes ON votaciones.id_participante = participantes.id WHERE votaciones.id_tarea = ?', [id], function(err, result) {
        if (err) throw err;
        res.json(result);
    });
});

export default router;