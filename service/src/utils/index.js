const { iff, isProvider } = require('feathers-hooks-common');
const configuration = require('@feathersjs/configuration');
const feathers = require('@feathersjs/feathers');
const crypto = require('crypto');
const errors = require('@feathersjs/errors');
const i18n = require('./i18n');

/**
 * This function return the first element on the data
 * @param {object} context - The global context of the service
 * @param {string} service - Service name
 * @param {object} query - Query object
 */
const findOne = async (context, service, data) => {
  const result = (await context.app.service(service).find({
    ...context.params,
    ...data,
    provider: undefined,
    paginate: false,
    query: {
      ...data.query,
      $limit: 1,
    }
  }))[0];

  return result;
};

/**
 * Obtiene la IP del cliente
 * @param {object} req - Petición
 */
const getClientIP = (req) => {
  const aForwarded = req.headers['x-forwarded-for'],
    sIP = aForwarded ? aForwarded.split(/, /)[0] : req.connection.remoteAddress;

  return sIP;
};

/**
 * Obtiene la lista de las llaves de un esquema
 * @param {object} oJoi - JOI Object
 */
const getKeysRecursive = (oJoi) => {
  let aKeys = [],
    oChildren = oJoi && oJoi._inner && oJoi._inner.children;

  if (Array.isArray(oChildren)) {
    oChildren.map(oRow => {
      aKeys.push(oRow.key);

      getKeysRecursive(oRow.schema).map(
        sKey => aKeys.push(sKey)
      );
    });
  }

  return aKeys;
};

/**
 * Genera un código numérico aleatorio del tamaño que recibe
 * @param {int} iLength - Tamaño del código
 */
const getRandomDigits = (iLength) => {
  let sResult = '',
    sChars = '0123456789',
    iCharLength = sChars.length,
    i = 0;

  for (i = 0; i < iLength; i++) {
    sResult += sChars.charAt(Math.floor(Math.random() * iCharLength));
  }

  return sResult;
};

/**
 * Genera un código numérico aleatorio del tamaño que recibe
 * @param {int} iLength - Tamaño del código
 */
const getRandomCode = (iLength, blnUppercase = false) => {
  let sResult = '',
    sChars = '0123456789abcdefghijklmnopqrstuvwxyz',
    iCharLength = sChars.length,
    i = 0;

  for (i = 0; i < iLength; i++) {
    sResult += sChars.charAt(Math.floor(Math.random() * iCharLength));
  }

  return blnUppercase ? sResult.toUpperCase() : sResult;
};

/**
 * Genera un token en base64
 * @param {*} param0
 */
const generateToken = ({ stringBase = 'base64', byteLength = 48 } = {}) => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(byteLength, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString(stringBase));
      }
    });
  });
};

/**
 * Obtiene un valor en especifico de las variables configuradas en vars
 * @param {string} sName - Nombre de la variable configurada
 */
const getConfigVars = sName => {
  let conf = configuration(),
    app = feathers().configure(conf),
    oVars = app.get('vars'),
    oValue;

  if (oVars) {
    oValue = oVars[sName];
  }

  return oValue;
};

/**
 * Esta función se encarga de hacer un rollback manual, para cuando
 * se creen documentos anidados
 * @param {object} context - Contexto global
 */
const fnRollback = async context => {
  // Si ocurre cualquier error en los servicios anidados deshacemos el cambio
  try {
    if (context.error.hook) {
      if (context.error.hook.result !== undefined) {
        const { method, path } = context.error.hook,
          { id } = context.error.hook.result;

        if (id !== undefined && method === 'create') {
          await context.app.service(path).remove(id);
        }
      }
    }
  } catch (err) {
    console.error(`[Error] Catch error to rollback a transition: `, err);
  }

  return context;
};

/**
 * This function is responsible to stick the user ID to the methods
 * create, find and get
 */
const fnStickyUser = iff(
  isProvider('rest'),
  async context => {
    const { user, _populate, $element, custom_rol, validate_rol } = context.params,
      { method } = context;

    let blnContinue = false;
    if (user && !_populate) {
      if (user.rol !== 'admin') {
        if (custom_rol) {
          if (custom_rol.indexOf(user.rol) === -1) {
            blnContinue = true;
          }
        } else {
          blnContinue = true;
        }
      } else if (method === 'create' && !context?.data?.user_id) {
        blnContinue = true;
      }

      if (blnContinue) {
        if (method === 'find' || method === 'get') {
          context.params.query.user_id = user.id;
        } else if (method === 'create') {
          if (validate_rol) {
            if (validate_rol.roles.indexOf(user.rol) === -1) {
              throw new errors.BadRequest(
                validate_rol.message,
              );
            }
          }

          if (!context.data.user_id) {
            context.data.user_id = user.id;
          }
        } else if (method === 'patch' || method === 'remove') {
          // Compare the record user_id with the current logged user
          if ($element.user_id !== user.id) {
            throw new errors.BadRequest(
              'You are not allowed to make changes to this record.',
              { label: 'API_UTILS_' }
            );
          }
        }
      } else if (validate_rol && ['create', 'patch'].indexOf(method) > -1) {
        if (context.data.user_id !== undefined) {
          const target = await findOne(context, 'users', {
            query: {
              id: context.data.user_id,
              status: 1,
              $select: ['id', 'rol_id'],
            }
          });

          if (!target) {
            throw new errors.BadRequest(
              'The user you are trying to assign does not exist or is inactive.',
              { label: 'API_UTILS_USER_NOT_EXIST' }
            );
          }

          const rol = await findOne(context, 'roles', {
            query: {
              id: target.rol_id,
              $select: ['id', 'group'],
            }
          });

          if (validate_rol.roles.indexOf(rol.group) === -1) {
            throw new errors.BadRequest(
              'The user you are trying to assign is not the type required for this instance.',
              { label: 'API_UTILS_USER_NOT_ROL' }
            );
          }
        }
      }
    }
  },
);

/**
 * This function is responsible to generate the URL to verify the user email and the forgot
 *
 * @param {object} context - Global context
 * @param {string} target - Target URL
 * @param {string} token - Token
 * @returns {string}
 */
const getTargetUrl = async (context = {}, target = '', token = '') => {
  let sLink = '',
    oConfig = {};

  const config = await context.app.service('configs').find({
    query: {
      slug: {
        $in: ['deep-config', 'default-pages']
      },
    }
  });

  if (config.total < 1) {
    throw new errors.BadRequest(
      i18n.single('default_page_not_config'),
      { label: 'API_GENERATE_URL_NOT_CONFIG' }
    );
  }

  config.data.map(item => {
    let sKey = item.slug.replace(/-/gi, '_');

    oConfig[sKey] = {};
    item.elements.map(single => {
      let sSub = single.slug.replace(/-/gi, '_');

      oConfig[sKey][sSub] = single.value;
    });
  });

  if (config.total === 2) {
    let aParams = [];

    aParams.push('token=' + encodeURIComponent(token));
    aParams.push('site=' + encodeURIComponent(oConfig.deep_config.website));
    aParams.push('play=' + encodeURIComponent(oConfig.deep_config.play_store));
    aParams.push('apple=' + encodeURIComponent(oConfig.deep_config.app_store));
    aParams.push('schema=' + encodeURIComponent(oConfig.deep_config.app_schema));
    aParams.push('app=' + encodeURIComponent(oConfig.default_pages[`${target}_app`]));
    aParams.push('page=' + encodeURIComponent(oConfig.default_pages[`${target}_page`]));

    sLink = `${oConfig.default_pages.website}/deep.html?${aParams.join('&')}`;
  } else {
    let sPage = oConfig.default_pages[`${target}_page`],
      sQuery = sPage.indexOf('.html') > -1 ? `?q=${token}` : `/${token}`;

    sLink = `${oConfig.default_pages.website}/${sPage}${sQuery}`;
  }

  return sLink;
};

/**
 * This function it's responsible to send email verification to user
 *
 * @param {object} context - Global context
 * @param {model} user - User model
 * @returns
 */
const sendEmailVerification = async (context, user) => {
  if (user.status !== 0 || !user.email) {
    return;
  }

  let sToken = await generateToken({ stringBase: 'hex' }),
    sLink = await getTargetUrl(context, 'verify', sToken),
    oData = {
      token: sToken,
    };

  await context.app.service('mail').create({
    content: await i18n.labelRender(
      context,
      { slug: 'verifyemailcontentlbl', section: 'email' },
      { link: sLink, ...user }
    ),
    title: await i18n.labelRender(context, {
      slug: 'verifyemailtitlelbl',
      section: 'email',
    }),
    email: user.email,
    reference_id: user.id,
    reference_type: 'verify_email',
  });

  await context.app.service('users').patch(user.id, oData);
};

module.exports = {
  findOne,
  fnRollback,
  fnStickyUser,
  generateToken,
  getClientIP,
  getConfigVars,
  getKeysRecursive,
  getRandomCode,
  getRandomDigits,
  getTargetUrl,
  sendEmailVerification,
};
