// Initializes the `equipos` service on path `/equipos`
const { Equipos } = require('./equipos.class');
const createModel = require('../../models/equipos.model');
const hooks = require('./equipos.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/equipos', new Equipos(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('equipos');

  service.hooks(hooks);
};  
