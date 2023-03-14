const assert = require('assert');
const app = require('../../src/app');

describe('\'eventos-details\' service', () => {
  it('registered the service', () => {
    const service = app.service('eventos-details');

    assert.ok(service, 'Registered the service');
  });
});
