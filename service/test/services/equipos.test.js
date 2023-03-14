const assert = require('assert');
const app = require('../../src/app');

describe('\'equipos\' service', () => {
  it('registered the service', () => {
    const service = app.service('equipos');

    assert.ok(service, 'Registered the service');
  });
});
