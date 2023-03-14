const Util = require('../utils');
const qs = require('qs');

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.use('*', (req, _, next) => {
    req.feathers.ip = Util.getClientIP(req);
    req.feathers.user_agent = req.useragent;

    let query = req.url.replace('/?', '');
    if (req.method === 'GET') {
      if (req.url.indexOf('?') > -1) {
        let aNewQuery = [],
          aParams = query.split('&');

        for (let value of aParams) {
          let aSplit = value.split('='),
            sValue = '';

          // ? iLike is only for PostgreSQL --> https://feathersjs.com/api/databases/knex.html
          if (aSplit[0].toLowerCase().indexOf('ilike') > -1 || aSplit[0].toLowerCase().indexOf('like') > -1) {
            sValue = `%${decodeURIComponent(aSplit[1].substr(1, aSplit[1].length - 2))}%`;
          } else {
            sValue = decodeURIComponent(aSplit[1]);
          }
          aNewQuery.push(`${aSplit[0]}=${sValue}`);
        }

        if (aNewQuery.length) {
          query = aNewQuery.join('&');
          req.query = qs.parse(query);
        }
      }
    }

    next();
  });
};
