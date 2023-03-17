const assert = require('assert');
const app = require('../../src/app');

describe('\'equipo-pdf\' service', () => {
  it('registered the service', () => {
    const service = app.service('equipo-pdf');

    assert.ok(service, 'Registered the service');
  });
});
