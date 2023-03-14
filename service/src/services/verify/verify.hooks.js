const { disallow, iff, isProvider } = require('feathers-hooks-common');
const errors = require('@feathersjs/errors');

const i18n = require('../../utils/i18n');

module.exports = {
  before: {
    all: [],
    find: [disallow()],
    get: [],
    create: [disallow()],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [
      iff(
        isProvider('rest'),
        async context => {
        const { id } = context;

        if (!id) {
          throw new errors.BadRequest(
            i18n.single('verify_invalid'),
            { label: 'API_VERIFY_INVALID' },
          );
        }

        // Buscamos el usuario que tenga el id
        const user = (await context.app.service('users').find({
          paginate: false,
          query: {
            status: 0,
            token: id,
            $limit: 1
          }
        }))[0];

        if (user) {
          // Actualizamos el estatus del usuario
          await context.app.service('users').patch(user.id, {
            token: '',
            status: 1
          });
        } else {
          throw new errors.BadRequest(
            i18n.single('verify_invalid'),
            { label: 'API_VERIFY_INVALID' },
          );
        }

        return context;
      }
    )],
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
