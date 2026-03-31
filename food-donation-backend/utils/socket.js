const socketIO = require('socket.io');

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join-chat', (data) => {
      socket.join(`chat_${data.foodId}`);
      console.log(`User joined chat for food: ${data.foodId}`);
    });

    socket.on('send-message', (data) => {
      io.to(`chat_${data.foodId}`).emit('new-message', data);
    });

    socket.on('typing', (data) => {
      socket.to(`chat_${data.foodId}`).emit('user-typing', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };