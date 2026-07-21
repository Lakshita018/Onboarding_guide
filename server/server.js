const http = require('http');
const app = require('./app');
const socketConfig = require('./config/socket');
require('./config/firebase'); // Initialize Firebase Admin SDK
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketConfig.init(server);

// Start Server
server.listen(PORT, () => {
  console.log(`IBM OnboardAI Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
