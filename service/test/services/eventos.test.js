const assert = require('assert');
const app = require('../../src/app');

describe('\'eventos\' service', () => {
  it('registered the service', () => {
    const service = app.service('eventos');

    assert.ok(service, 'Registered the service');
  });
});
