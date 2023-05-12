// Initializes the `tiempo-entrenamiento` service on path `/tiempo-entrenamiento`
const { TiempoEntrenamiento } = require('./tiempo-entrenamiento.class');
const hooks = require('./tiempo-entrenamiento.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/tiempo-entrenamiento', new TiempoEntrenamiento(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('tiempo-entrenamiento');

  service.hooks(hooks);
};
