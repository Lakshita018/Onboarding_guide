const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const User = require('./User');
const { ACCESS_REQUEST_STATUS } = require('../utils/constants');

const AccessRequest = sequelize.define('AccessRequest', {
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
  application_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: ACCESS_REQUEST_STATUS.PENDING,
    validate: {
      isIn: [[ACCESS_REQUEST_STATUS.PENDING, ACCESS_REQUEST_STATUS.APPROVED, ACCESS_REQUEST_STATUS.REJECTED]]
    }
  },
  requested_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
}, {
  tableName: 'access_requests',
  timestamps: false,
});

Employee.hasMany(AccessRequest, { foreignKey: 'employee_id', onDelete: 'CASCADE' });
AccessRequest.belongsTo(Employee, { foreignKey: 'employee_id' });
User.hasMany(AccessRequest, { foreignKey: 'approved_by' });
AccessRequest.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

module.exports = AccessRequest;
