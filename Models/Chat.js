const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// const Chat = sequelize.define('Chat', {
//   inquiryId: { type: DataTypes.INTEGER, allowNull: false },
//   senderId: { type: DataTypes.INTEGER, allowNull: false },
//   message: { type: DataTypes.TEXT, allowNull: false },
// });

// module.exports = Chat;


// import { DataTypes } from "sequelize";
// import sequelize from "../config/database";
// import Quotation from "./Quotation";
const Quotation = require('./Quotation')

const Revision = sequelize.define("Revision", {
  quotationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Quotation,
      key: "id",
    },
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports =  Revision;
