const { authenticate } = require('@feathersjs/authentication').hooks;
const { disallow, isProvider, iff } = require('feathers-hooks-common');
const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks;
const validate = require('@feathers-plus/validate-joi');
const errors = require('@feathersjs/errors');
const bcrypt = require('bcryptjs');
const ms = require('ms');

const joiOptions = require('../../utils/joi.options').options();
const Schema = require('../../schemas/users.schema');
const Utils = require('../../utils');
const i18n = require('../../utils/i18n');

const DEFAULT_ROLE = process.env.CONFIG_DEFAULT_ROLE;

const validatePassword = async (context) => {
  let { $element: old } = context.params;
  if (!old && context.id) {
    old = await context.app.service('users').get(context.id);
  }

  const { data } = context,
    { password, rpassword } = data,
    HISTORY_LENGTH = parseInt(process.env.CONFIG_PASS_HISTORY || '6', 10);

  // Check if trying to edit the password
  if (password) {
    // Validate if the user tries to update within the allowed time
    if (old.pass_changed) {
      let iExpire = old.pass_changed.getTime(),
        iCurrent = Date.now(),
        sTime = process.env.CONFIG_PASS_CHANGED || '24h';

      if (iCurrent < iExpire) {
        throw new errors.BadRequest(
          `It's not allowed to change the password again, until after the period of "${sTime}"`
        );
      }
    }

    if (old.pass_history) {
      let aToCompare = [].concat(old.pass_history);
      aToCompare.push(old.password);

      let aComparePlain = [];
      aComparePlain.push(old.email.substr(0, old.email.indexOf('@')));
      aComparePlain.push(old.full_name);

      for (let sCompare of aComparePlain) {
        if (rpassword.toLowerCase().indexOf(sCompare.toLowerCase()) > -1) {
          throw new errors.BadRequest(
            'You cannot use a weak password, please specify another'
          );
        }
      }

      // Check if the new password already used
      for (let sOldPass of aToCompare) {
        if (bcrypt.compareSync(rpassword, sOldPass)) {
          throw new errors.BadRequest(
            'You cannot use a password that you have used recently, please choose another.'
          );
        }
      }

      if (old.pass_history.length >= HISTORY_LENGTH) {
        old.pass_history.shift();
      }
      old.pass_history.push(password);
      data.pass_history = old.pass_history;
    } else {
      data.pass_history = [password];
    }

    const PASS_CHANGED = ms(process.env.CONFIG_PASS_CHANGED || '24h'),
      PASS_EXPIRE = ms(process.env.CONFIG_PASS_EXPIRE || '180d');

    data.pass_changed = new Date(Date.now() + PASS_CHANGED);
    data.pass_expires = new Date(Date.now() + PASS_EXPIRE);
  }
};

/**
 * Esta función se encarga de verificar si las contraseñas coinciden
 * entre passwords y repeat password
 * @param {object} context - Contexto global
 */
const fnCheckPasswords = async context => {

  const { password, rpassword } = context.data;

  if (password !== rpassword) {
    throw new errors.BadRequest(i18n.single('register_pass_not_match'), {
      label: 'API_USER_PASS_NOT_MATCH',
    });
  } else if (password === '') {
    delete context.data.password;
  }

  return context;
};

/**
 * Send the email verification
 *
 * @param {object} context - Global context
 * @returns
 */
const sendEmailVerification = iff(
  isProvider('rest'),
  async context => {
    const { result } = context;

    await Utils.sendEmailVerification(context, result);
  }
);

/**
 * This function is responsible to stick the user id when the user rol is different to admin,
 * also if the user try to find a user by rol name, find the rol first.
 *
 * @param {object} context - Global context
 */
const fnStickyQuery = async context => {
  let { user, query, _populate } = context.params;

  if (!_populate) {
    if (user) {
      if (['admin'].indexOf(user.rol) === -1) {
        query.id = user.id;
      }

      if (query.rol) {
        const rol = await Utils.findOne(context, 'roles', {
          query: {
            group: query.rol,
            $limit: 1,
            $select: ['id', 'group']
          }
        });

        if (rol) {
          query.rol_id = rol.id;
        }

        delete query.rol;
      }
    }
  }
};

const fnStickyRole = iff(
  isProvider('rest'),
  async context => {

  }
);

const customPopulate = iff(
  isProvider('rest'),
  context => {
    const sequelize = context.app.get('sequelizeClient'),
      { roles } = sequelize.models;

    if (roles) {
      context.params.sequelize = {
        include: [{
          model: roles,
          attributes: ['id', 'group', 'name'],
        }],
        raw: false,
      };
    }
  },
)

module.exports = {
  before: {
    all: [],
    find: [
      authenticate('jwt'),
      iff(
        isProvider('rest'),
        fnStickyQuery
      ),
      customPopulate,
    ],
    get: [
      authenticate('jwt'),
      iff(
        isProvider('rest'),
        fnStickyQuery
      )
    ],
    create: [
      fnCheckPasswords,
      // fnStickyRole,
      validate.form(Schema.POST_SCHEMA, joiOptions),
      hashPassword('password')
    ],
    update: [disallow('rest')],
    patch: [
      fnCheckPasswords,
      validate.form(Schema.PATCH_SCHEMA, joiOptions),
      iff(
        isProvider('rest'),
        async context => {
          const { user } = context.params,
            { id } = context;

          if (['admin'].indexOf(user.rol) === -1) {
            if (id !== user.id) {
              throw new errors.MethodNotAllowed(
                'No tienes permitido editar este usuario',
                { label: 'API_USER_NOT_ALLOWED_EDIT' }
              );
            }
          }
        },
      ),
      hashPassword('password'),
      authenticate('jwt')
    ],
    remove: [disallow('rest')]
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect(
        'password',
        'token_expires',
        'token_password',
        'token',
        'pass_changed',
        'pass_history'
      ),
    ],
    find: [],
    get: [],
    // create: [sendEmailVerification],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [Utils.fnRollback],
    update: [],
    patch: [],
    remove: [],
  },
};
