// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const Invoice = sequelize.define('Invoice', {
//   quotationId: { type: DataTypes.INTEGER, allowNull: false },
//   invoiceNumber: { type: DataTypes.STRING, allowNull: false },
//   amount: { type: DataTypes.FLOAT, allowNull: false },
//   paymentMethod: { type: DataTypes.ENUM('cash', 'credit'), allowNull: false },
//   filePath: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   status: { type: DataTypes.ENUM('pending', 'completed'), defaultValue: 'pending' },
// });

// module.exports = Invoice;


const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  quotationId: { type: DataTypes.INTEGER, allowNull: false },
  invoiceNumber: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  paymentMethod: { type: DataTypes.ENUM('cash', 'credit'), allowNull: false },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: { type: DataTypes.ENUM('paid', 'credit'), defaultValue: 'credit' },
});

module.exports = Invoice;