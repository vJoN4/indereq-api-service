const { authenticate } = require('@feathersjs/authentication').hooks;
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
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [async context => {
      const { result, data, params} = context;
      const { jugadores } = data;

      if (jugadores?.length) {
        const { id } = result;        
        for (const jugador of jugadores) {
          await context.app.service('deportistas').patch(jugador, { equipo_id: id }, params);
        }
      }

      return context;
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
