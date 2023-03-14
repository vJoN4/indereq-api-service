const { JWTStrategy } = require('@feathersjs/authentication');
const { Forbidden, NotAuthenticated } = require('@feathersjs/errors');

const i18n = require('../utils/i18n');

exports.CustomJwtStrategy = class CustomJwtStrategy extends JWTStrategy {
  async authenticate(authentication, params) {
    const { accessToken } = authentication,
      { entity } = this.configuration;

    if (!accessToken) {
      throw new NotAuthenticated('No access token');
    }

    const payload = await this.authentication.verifyAccessToken(accessToken, params.jwt);

    // If token type is refresh token then throw error
    if (payload.tokenType === 'refresh') {
      throw new NotAuthenticated('Invalid access token');
    }

    const result = {
      accessToken,
      authentication: {
        strategy: 'jwt',
        accessToken,
        payload
      }
    };

    if (entity === null) {
      return result;
    }

    const entityId = await this.getEntityId(result, params),
      value = await this.getEntity(entityId, params);

    if (value.status === 0) {
      throw new Forbidden(
        i18n.single('auth_not_verified'),
        { label: 'API_USER_UNVERIFIED' }
      );
    } else if (value.status === 2) {
      throw new Forbidden(
        i18n.single('auth_inactive'),
        { label: 'API_USER_INACTIVE' }
      );
    }

    const rol = await this.app.service('roles').get(value.rol_id);
    if (rol) {
      value.rol = rol.group;
      value.rol_name = rol.name;
    }

    return {
      ...result,
      [entity]: value
    };
  }
};
