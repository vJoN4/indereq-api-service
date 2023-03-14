// Initializes the `asistencias` service on path `/asistencias`
const { Asistencias } = require('./asistencias.class');
const createModel = require('../../models/asistencias.model');
const hooks = require('./asistencias.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/asistencias', new Asistencias(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('asistencias');

  service.hooks(hooks);
};
