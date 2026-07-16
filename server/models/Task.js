const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const User = require('./User');
const { TASK_STATUS } = require('../utils/constants');

const Task = sequelize.define('Task', {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  assigned_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: TASK_STATUS.PENDING,
    validate: {
      isIn: [[TASK_STATUS.PENDING, TASK_STATUS.IN_PROGRESS, TASK_STATUS.COMPLETED]]
    }
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'tasks',
  timestamps: false,
});

Employee.hasMany(Task, { foreignKey: 'employee_id', onDelete: 'CASCADE' });
Task.belongsTo(Employee, { foreignKey: 'employee_id' });
User.hasMany(Task, { foreignKey: 'assigned_by' });
Task.belongsTo(User, { foreignKey: 'assigned_by', as: 'assigner' });

module.exports = Task;
