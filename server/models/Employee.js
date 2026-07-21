const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const { ONBOARDING_STAGES, OS_TYPES, EMPLOYEE_STATUS } = require('../utils/constants');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  designation: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  manager: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  buddy: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  joining_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  onboarding_stage: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: ONBOARDING_STAGES.NOT_STARTED,
    validate: {
      isIn: [[ONBOARDING_STAGES.NOT_STARTED, ONBOARDING_STAGES.IN_PROGRESS, ONBOARDING_STAGES.COMPLETED]]
    }
  },
  offer_accepted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  os_type: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      isIn: [[null, OS_TYPES.WINDOWS, OS_TYPES.MAC, OS_TYPES.LINUX]]
    }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: EMPLOYEE_STATUS.ACTIVE,
    validate: {
      isIn: [[EMPLOYEE_STATUS.ACTIVE, EMPLOYEE_STATUS.INACTIVE]]
    }
  },
}, {
  tableName: 'employees',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Setup relationships
User.hasOne(Employee, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Employee.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Employee;
