const roles = require('./roles/roles.service.js');
const users = require('./users/users.service.js');
const verify = require('./verify/verify.service.js');
const version = require('./version/version.service.js');
const blacklist = require('./blacklist/blacklist.service.js');

const deportistas = require('./deportistas/deportistas.service.js');
const equipos = require('./equipos/equipos.service.js');
const asistencias = require('./asistencias/asistencias.service.js');
const eventos = require('./eventos/eventos.service.js');
const eventosDetails = require('./eventos-details/eventos-details.service.js');

const equipoPdf = require('./equipo-pdf/equipo-pdf.service.js');

module.exports = function (app) {
  app.configure(roles);
  app.configure(users);
  app.configure(verify);
  app.configure(version);
  app.configure(blacklist);
  app.configure(deportistas);
  app.configure(equipos);
  app.configure(asistencias);
  app.configure(eventos);
  app.configure(eventosDetails);
  app.configure(equipoPdf);
};
