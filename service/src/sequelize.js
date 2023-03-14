const Sequelize = require('sequelize');

module.exports = (app) => {
  let options = {
      database: process.env.SEQUELIZE_DATABASE,
      username: process.env.SEQUELIZE_USERNAME,
      password: process.env.SEQUELIZE_PASSWORD,
      host: process.env.SEQUELIZE_ADVERTISED_HOSTNAME,
      port: parseInt(process.env.SEQUELIZE_PORT, 10),
      dialect: 'mysql',
    },
    isSSL = process.env.SEQUELIZE_SSL;

  if (isSSL !== undefined) {
    if (isSSL === 'true') {
      options.dialectOptions = {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        }
      };
    }
  }

  const sequelize = new Sequelize(options);
  const oldSetup = app.setup;

  app.set('sequelizeClient', sequelize);

  app.setup = function (...args) {
    const result = oldSetup.apply(this, args);

    // Set up data relationships
    const models = sequelize.models;
    Object.keys(models).forEach((name) => {
      if ('associate' in models[name]) {
        models[name].associate(models);
      }
    });

    // Sync to the database
    app.set('sequelizeSync', sequelize.sync({ alter: true }));

    return result;
  };
};
