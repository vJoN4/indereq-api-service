const { authenticate } = require('@feathersjs/authentication').hooks;
const moment = require('moment');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [async context => {
      // ? { deportistaId, fechaInicio, fechaFin }
      const { data } = context;
      let asistencias = [],
        oQuery = {
          query: {
            deportista_id: data.deportistaId,
            horaSalida: {
              $ne: null
            },
          },
          paginate: false
        };

      if (data.fechaInicio && data.fechaFin) {
        oQuery.query.fecha = {
          $gte: moment(data.fechaInicio).format('YYYY-MM-DD'),
          $lte: moment(data.fechaFin).format('YYYY-MM-DD'),
        };
      } else {
        oQuery.query.fecha = {
          $gte: moment().startOf('week').format('YYYY-MM-DD'),
          $lte: moment().endOf('week').format('YYYY-MM-DD'),
        };
      }

      asistencias = await context.app.service('asistencias').find(oQuery);

      if (asistencias.length) {
        const aTrained = asistencias.map(a => duration = moment.duration(moment(a.horaSalida, "HH:mm").diff(moment(a.horaEntrada, "HH:mm"))));
        let total_trained = moment.duration();
        
        aTrained.forEach(time => {
          total_trained.add(time);
        });

        total_trained = moment.utc(total_trained.asMilliseconds()).format("HH:mm:ss");

        context.result = {
          total_trained
        }
      } else {
        context.result = {
          total_trained: null
        }
      }
    }],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
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
