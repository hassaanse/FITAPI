// models/View.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Inquiry = sequelize.define('Inquiry', {
  companyName: { type: DataTypes.STRING, allowNull: false },
  customerName: { type: DataTypes.STRING, allowNull: false },
  contactNumber: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  requirementDetails: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('sent', 'pending', 'approved', 'rejected', 'completed'), defaultValue: 'sent' },
  category: { type: DataTypes.ENUM('Supplies', 'Field'), allowNull: false },
});

module.exports = Inquiry;
