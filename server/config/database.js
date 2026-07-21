const { Sequelize } = require('sequelize');
require('dotenv').config();

const path = require('path');

const dbUrl = process.env.DATABASE_URL || 'sqlite://database.sqlite';
let sequelize;

if (dbUrl.startsWith('sqlite:')) {
  // SQLite Fallback
  const rawPath = dbUrl.replace('sqlite://', '');
  const storagePath = path.isAbsolute(rawPath) 
    ? rawPath 
    : path.resolve(__dirname, '..', rawPath || 'database.sqlite');
  
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: console.log, // Set to console.log for query logging
  });
  console.log(`Database connected via SQLite: ${storagePath}`);
} else {
  // PostgreSQL Connection
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: false,
  });
  console.log('Database connected via PostgreSQL');
}

module.exports = sequelize;
