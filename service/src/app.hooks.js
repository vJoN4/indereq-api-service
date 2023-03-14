// Application hooks that run for every service
const { iff, isProvider } = require('feathers-hooks-common');

const log = require('./utils/log');
const authorize = require('./utils/abilities');
const authenticate = require('./strategies/authenticate');

const stickyControlUsers = iff(
  isProvider('rest'),
  async context => {
    const { data, method } = context,
      { user } = context.params;

    if (user) {
      if (method === 'create') {
        data.created_by = user.id;
      } else if (method === 'patch') {
        data.updated_by = user.id;
      }
    }
  }
);

module.exports = {
  before: {
    all: [
      iff(
        (hook) =>
          hook.params.provider &&
          `/${hook.path}` !== hook.app.get('authentication').path,
        [authenticate, authorize]
      ),
    ],
    find: [],
    get: [],
    create: [stickyControlUsers],
    update: [],
    patch: [stickyControlUsers],
    remove: [],
  },

  after: {
    all: [log()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [log()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
