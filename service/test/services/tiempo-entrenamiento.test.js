const assert = require('assert');
const app = require('../../src/app');

describe('\'tiempo-entrenamiento\' service', () => {
  it('registered the service', () => {
    const service = app.service('tiempo-entrenamiento');

    assert.ok(service, 'Registered the service');
  });
});
