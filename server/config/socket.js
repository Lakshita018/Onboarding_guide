const socketIo = require('socket.io');

let io;

function init(server) {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Join room for specific employee updates
    socket.on('join', (roomName) => {
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO has not been initialized!');
  }
  return io;
}

module.exports = {
  init,
  getIO
};
