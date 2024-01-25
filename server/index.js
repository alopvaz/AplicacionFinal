// Importar las librerías necesarias
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import session from 'express-session';
import router from './routes.js';

// Importar el router de login
import loginRouter from './routes/login.js'; 

// Crear una nueva aplicación Express
const app = express();

// Configurar CORS para permitir conexiones desde 'http://localhost:5173'
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Configurar la aplicación para usar JSON y URL encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar la aplicación para usar sesiones
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Usar el router
app.use('/', router);
app.use('/', loginRouter); 

// Middleware para añadir el rol a las respuestas locales
app.use((req, res, next) => {
  res.locals.role = req.session.role;
  next();
});









// Crear un nuevo servidor HTTP a partir de la aplicación Express
const server = http.createServer(app);

// Crear un nuevo servidor Socket.IO a partir del servidor HTTP
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173'
  }
});

// Almacén de cartas seleccionadas por los usuarios
const cartasSeleccionadas = {};

// Escuchar el evento 'connection' para cada nueva conexión Socket.IO
io.on('connection', (socket) => {
  console.log('a user connected');
  console.log(socket.id)

  // Escuchar el evento 'message' para cada mensaje recibido
  socket.on('message', (message) => {
    message.from = socket.id;
    // Emitir el mensaje a todos los clientes conectados
    io.emit('message', message);
  });

  // Escuchar el evento 'nueva-tarea'
  socket.on('nueva-tarea', (tarea) => {
    // Emitir la nueva tarea a todos los clientes conectados
    io.emit('nueva-tarea', tarea);
  });

  socket.on('nueva-carta', (nombre, carta, userId) => {
    // Emitir la nueva carta a todos los clientes conectados
    io.emit('nueva-carta', { nombre, carta, userId });
  });

  // Escuchar el evento 'carta-seleccionada' para cada carta seleccionada recibida
  socket.on('carta-seleccionada', (usuario, carta) => {
    // Almacenar la carta seleccionada por el usuario
    cartasSeleccionadas[usuario] = carta;

    // Emitir la carta seleccionada a todos los clientes conectados
    io.emit('carta-seleccionada', usuario, carta);
    // Emitir un evento para indicar que un usuario ha seleccionado una carta
    io.emit('usuario-seleccionado', usuario);
  });

  // Escuchar el evento 'revelar-cartas'
  socket.on('revelar-cartas', () => {
    // Emitir el evento 'revelar-cartas' a todos los clientes conectados
    io.emit('revelar-cartas', cartasSeleccionadas);
  });

  socket.on('reset-votacion', () => {
    // Reiniciar las cartas seleccionadas
    Object.keys(cartasSeleccionadas).forEach((usuario) => {
      cartasSeleccionadas[usuario] = null;
    });

    // Emitir el evento 'reset-votacion' a todos los clientes conectados
    io.emit('reset-votacion');
    io.emit('reset-carta-seleccionada');

  });

  socket.on('carta-admin-seleccionada', (carta) => {
    // Reemitir el evento a todos los clientes conectados
    io.emit('carta-admin-seleccionada', carta);
  });

   // Manejar el evento 'crear-sesion'
   socket.on('crear-sesion', (nombreSesion) => {
    // Emitir un evento 'sesion-disponible' a todos los clientes
    io.emit('sesion-disponible', nombreSesion);
  });

  socket.on('iniciar-tarea', () => {
    // Emite el evento 'iniciar-tarea' a todos los clientes
    io.emit('iniciar-tarea');
  });

  
});

// Iniciar el servidor en el puerto 3000
server.listen(3000, () => {
  console.log('Server is running on port 3000');
});