// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('FIT-ERP', 'root', '12345', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;
