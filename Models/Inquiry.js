// models/View.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Inquiry = sequelize.define('Inquiry', {
  companyName: { type: DataTypes.STRING, allowNull: false },
  customerName: { type: DataTypes.STRING, allowNull: false },
  contactNumber: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  requirementDetails: { type: DataTypes.JSON, allowNull: false },
  status: { type: DataTypes.ENUM('Inquiry Sent', 'Quotation generated', 'Quotation Revision', 'Quotation Rejected', 'Quotation Accepted' , 'Deployment Done', 'Invoice Generated' , 'Finished Job'), defaultValue: 'Inquiry Sent' },
  category: { type: DataTypes.ENUM('Supplies', 'Sales', 'Services', 'Office Network Setup', 'Web Services', 'Security System'), allowNull: false }, price: { type: DataTypes.STRING, allowNull: true }, // Added price field
});

module.exports = Inquiry;
