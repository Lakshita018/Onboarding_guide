const sequelize = require('./config/database');

// Require all models to ensure they register with Sequelize
const User = require('./models/User');
const Employee = require('./models/Employee');
const Document = require('./models/Document');
const ChecklistItem = require('./models/ChecklistItem');
const Task = require('./models/Task');
const AccessRequest = require('./models/AccessRequest');
const ChatLog = require('./models/ChatLog');

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Sync models
    await sequelize.sync({ alter: true });
    
    console.log('Database migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
