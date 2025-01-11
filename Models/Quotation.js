const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quotation = sequelize.define('Quotation', {
  inquiryId: { type: DataTypes.INTEGER, allowNull: false },
  quotationDetails: { type: DataTypes.TEXT, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.ENUM('sent', 'accepted', 'rejected'), defaultValue: 'sent' },
});

module.exports = Quotation;
