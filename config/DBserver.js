// config/database.js

const { Sequelize } = require('sequelize');

const configurations = require('../ServerConfig.json');

const sequelize = new Sequelize(configurations.development);

module.exports = sequelize;
