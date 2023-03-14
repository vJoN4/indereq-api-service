const { LocalStrategy } = require('@feathersjs/authentication-local');
const { Forbidden } = require('@feathersjs/errors');

const i18n = require('../utils/i18n');

exports.CustomLocalStrategy = class CustomLocalStrategy extends LocalStrategy {
  async authenticate(data, params) {
    const payload = await super.authenticate(data, params);

    if (payload.user.status === 0) {
      throw new Forbidden(
        i18n.single('auth_not_verified'),
        { label: 'API_USER_UNVERIFIED' }
      );
    } else if (payload.user.status === 2) {
      throw new Forbidden(
        i18n.single('auth_inactive'),
        { label: 'API_USER_INACTIVE' }
      );
    }

    const rol = await this.app.service('roles').get(payload.user.rol_id);
    if (rol) {
      payload.user.rol = rol.group;
      payload.user.rol_name = rol.name;
    }

    return payload;
  }
};
