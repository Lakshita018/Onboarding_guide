const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const { CHECKLIST_PRIORITIES } = require('../utils/constants');

const ChecklistItem = sequelize.define('ChecklistItem', {
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
  priority: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: CHECKLIST_PRIORITIES.MEDIUM,
    validate: {
      isIn: [[CHECKLIST_PRIORITIES.HIGH, CHECKLIST_PRIORITIES.MEDIUM, CHECKLIST_PRIORITIES.LOW]]
    }
  },
  completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'checklist_items',
  timestamps: false,
});

Employee.hasMany(ChecklistItem, { foreignKey: 'employee_id', onDelete: 'CASCADE' });
ChecklistItem.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = ChecklistItem;
