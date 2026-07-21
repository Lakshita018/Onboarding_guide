const http = require('http');
const app = require('./app');
const socketConfig = require('./config/socket');
const sequelize = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketConfig.init(server);

// Synchronize Database and Start Server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database authenticating connection successful.');

    // Start listening
    server.listen(PORT, () => {
      console.log(`IBM OnboardAI Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Fatal error starting application server:', error);
    process.exit(1);
  }
};

startServer();
