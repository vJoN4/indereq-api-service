const { authenticate } = require('@feathersjs/authentication').hooks;
const { iff, isProvider } = require('feathers-hooks-common');

const fnCustomPopulate = iff(
  isProvider('rest'),
  async context => {
    const sequelize = context.app.get('sequelizeClient'),
      { eventos_details, deportistas, equipos } = sequelize.models;

    context.params.sequelize = {
      include: [
        {
          as: 'EquipoLocal',
          model: equipos,
          attributes: ['id', 'nombre']
        },
        {
          as: 'EquipoVisitante',
          model: equipos,
          attributes: ['id', 'nombre']
        },
        {
          model: eventos_details,
          attributes: ['id'],
          include: [
            {
              model: deportistas,
              attributes: ['id', 'nombres', 'apellidos', 'numJugador'],
              include: [
                {
                  model: equipos,
                  attributes: ['id', 'nombre']
                }
              ]
            }
          ]
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
      const { data, result, params } = context;

      await context.app.service('eventos-details').create(data.jugadores.map(id => ({
        evento_id: result.id,
        deportista_id: id
      })), params);

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
