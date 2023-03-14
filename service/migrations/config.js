const app = require('../src/app');
const env = process.env.NODE_ENV || 'development';
const dialect = 'mysql'; // Or your dialect name

module.exports = {
  [env]: {
    dialect,
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false,
    //   },
    // },
    url: app.get(dialect),
    migrationStorageTableName: '_migrations',
    username: process.env.SEQUELIZE_USERNAME,
    password: process.env.SEQUELIZE_PASSWORD,
    database: process.env.SEQUELIZE_DATABASE,
    host: process.env.SEQUELIZE_ADVERTISED_HOSTNAME,
    port: parseInt(process.env.SEQUELIZE_PORT, 10),
  }
};
