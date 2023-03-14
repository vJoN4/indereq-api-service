
// Initializes the `eventos-details` service on path `/eventos-details`
const { EventosDetails } = require('./eventos-details.class');
const createModel = require('../../models/eventos-details.model');
const hooks = require('./eventos-details.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: ['create'],
  };

  // Initialize our service with any options it requires
  app.use('/eventos-details', new EventosDetails(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('eventos-details');

  service.hooks(hooks);
};
