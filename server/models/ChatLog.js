const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const { CHAT_SENDER } = require('../utils/constants');

const ChatLog = sequelize.define('ChatLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Employee,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  sender: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [[CHAT_SENDER.EMPLOYEE, CHAT_SENDER.ASSISTANT]]
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'chat_logs',
  timestamps: false,
});

Employee.hasMany(ChatLog, { foreignKey: 'employee_id', onDelete: 'CASCADE' });
ChatLog.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = ChatLog;
