const { authenticate } = require('@feathersjs/authentication').hooks;
const Op = require("sequelize").Op;
const moment = require('moment');
const { iff, isProvider } = require('feathers-hooks-common');

const fnCustomPopulate = iff(
  isProvider('rest'),
  async context => {
    const sequelize = context.app.get('sequelizeClient'),
      { deportistas } = sequelize.models;

    context.params.sequelize = {
      include: [
        {
          model: deportistas,
          attributes: ['id', 'nombres', 'apellidos'],
        },
      ],
      raw: false,
    };
  },
);

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [fnCustomPopulate],
    get: [fnCustomPopulate],
    create: [async context => {
      const { data } = context;
      const { id, fecha } = data;

      const parsedDate = moment(fecha).format('YYYY-MM-DD');
      const parsedDateTime = parsedDate + ' ' + moment(fecha).format('HH:mm:ss');

      const asistencias = await context.app.service('asistencias').find({
        query: {
          deportista_id: id,
          fecha: parsedDate,
          horaEntrada: {
            [Op.not]: null
          },
          horaSalida: null
        }});

        const deportista = await context.app.service('deportistas').get(id);

      // ? If there is an asistencia with the same date and no horaSalida, then update it
      if (asistencias.data.length === 1) {
        context.result = await context.app.service('asistencias').patch(asistencias.data[0].id, {
          horaSalida: parsedDateTime
        });

        context.result.deportista = deportista;
        delete context.data;
        return context;
      } 
      else {
        // ? Modify context.data to insert a new record
        context.data = {
          deportista_id: id,
          fecha: parsedDate,
          horaEntrada: parsedDateTime,
          horaSalida: null,
        };
      }

      // TODO: Validate if the horaEntrada is before the horaSalida and if there is an interval of (-time to define-) between them

      return context;
    }],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [async context => {

      const { result } = context;
      const { deportista_id } = result;

      const deportista = await context.app.service('deportistas').get(deportista_id);

      context.result = {
        ...result,
        deportista,
      }
    }],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
