// Initializes the `equipo-pdf` service on path `/equipo-pdf`
const { EquipoPdf } = require('./equipo-pdf.class');
const hooks = require('./equipo-pdf.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/equipo-pdf', new EquipoPdf(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('equipo-pdf');

  service.hooks(hooks);
};
