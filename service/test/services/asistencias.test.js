const assert = require('assert');
const app = require('../../src/app');

describe('\'asistencias\' service', () => {
  it('registered the service', () => {
    const service = app.service('asistencias');

    assert.ok(service, 'Registered the service');
  });
});
