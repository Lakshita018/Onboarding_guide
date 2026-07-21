/**
 * server/socket/socketHandler.js
 *
 * Socket.IO event handler.
 * Employees join a personal room so the server can push targeted events.
 *
 * Room naming: `employee:<employeeId>`
 */

const jwt    = require('jsonwebtoken');
const { SOCKET_EVENTS } = require('../config/constants');

let _io = null;  // Shared Socket.IO instance

/**
 * Initialise Socket.IO and register all event handlers.
 * @param {import('socket.io').Server} io
 */
function initSocket(io) {
  _io = io;

  io.use((socket, next) => {
    // Authenticate via token in handshake auth or query
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user   = decoded;  // Attach user to socket
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.user?.email} (${socket.id})`);

    // Employee joins their personal room
    socket.on(SOCKET_EVENTS.JOIN_ROOM, ({ employeeId }) => {
      if (employeeId && socket.user?.role === 'employee') {
        const room = `employee:${employeeId}`;
        socket.join(room);
        console.log(`[Socket] ${socket.user.email} joined room: ${room}`);
      }
    });

    // Admin joins a general admin room
    if (socket.user?.role === 'admin') {
      socket.join('admins');
    }

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.user?.email} (${socket.id})`);
    });
  });
}

/**
 * Get the shared Socket.IO instance.
 * Throws if socket hasn't been initialised yet.
 */
function getIO() {
  if (!_io) throw new Error('Socket.IO not initialised');
  return _io;
}

module.exports = { initSocket, getIO };
