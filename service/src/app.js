const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const serveIndex = require('serve-index');

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

const logger = require('./logger');
const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');

const authentication = require('./authentication');

const sequelize = require('./sequelize');

const app = express(feathers());

// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(helmet({
  contentSecurityPolicy: false
}));

// ? https://expressjs.com/en/resources/middleware/cors.html
app.use(
  cors({
    origin: process.env.CONFIG_WHITELIST_SITES ? function (origin, callback) {
      const whitelist = process.env.CONFIG_WHITELIST_SITES;

      if (whitelist) {
        if (whitelist.split(',').indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } : true,
    methods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  })
);
app.use(compress());
app.use(
  '/uploads',
  express.static(path.join(app.get('public'), 'uploads')),
  serveIndex(path.join(app.get('public'), 'uploads'), { icons: true })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio({
  path: '/ws/',
  origins: '*:*',
  handlePreflightRequest: (req, res) => {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST',
      'Access-Control-Allow-Credentials': true
    });
    res.end();
  },
  allowRequest: process.env.CONFIG_WHITELIST_SITES ? (req, callback) => {
    const whitelist = process.env.CONFIG_WHITELIST_SITES;

    if (whitelist) {
      if (whitelist.split(',').indexOf(req.headers.origin) !== -1 || !req.headers.origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  } : null,
}));

// Other setup for sequelize and the bucket
app.configure(sequelize);

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
app.configure(authentication);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

module.exports = app;
