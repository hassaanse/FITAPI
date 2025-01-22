const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Inquiry = require('./Inquiry');
// const Inquiry = require('./Inquiry'); 

const Quotation = sequelize.define('Quotation', {
  quotationName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  inquiryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Inquiry, // Reference to the Inquiry model
      key: 'id', // Foreign key in the Inquiry model
    },
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Quotation;


// const Quotation = sequelize.define('Quotation', {
//   quotationName: { type: DataTypes.STRING, allowNull: false },
//   // inquiryId: {
//   //   type: DataTypes.INTEGER,
//   //   allowNull: false,
//   //   references: {
//   //     model: 'Inquiries', // Table name should match the one in your database
//   //     key: 'id',
//   //   },
//   // },
//   filePath: { type: DataTypes.STRING, allowNull: false },
// });

// // Quotation.belongsTo(require('./Inquiry'), { foreignKey: 'inquiryId' }); // Association
// module.exports = Quotation;
