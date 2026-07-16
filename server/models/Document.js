const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const { DOCUMENT_TYPES, DOCUMENT_STATUS } = require('../utils/constants');

const Document = sequelize.define('Document', {
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
  document_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  document_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isIn: [[DOCUMENT_TYPES.ID_PROOF, DOCUMENT_TYPES.EDUCATION_CERTIFICATE, DOCUMENT_TYPES.OFFER_LETTER]]
    }
  },
  file_path: {
    type: DataTypes.STRING(512),
    allowNull: false,
  },
  verification_status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: DOCUMENT_STATUS.PENDING,
    validate: {
      isIn: [[DOCUMENT_STATUS.PENDING, DOCUMENT_STATUS.VERIFIED, DOCUMENT_STATUS.REJECTED]]
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'documents',
  timestamps: false,
});

Employee.hasMany(Document, { foreignKey: 'employee_id', onDelete: 'CASCADE' });
Document.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = Document;
