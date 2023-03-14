const assert = require('assert');
const app = require('../../src/app');

describe('\'deportistas\' service', () => {
  it('registered the service', () => {
    const service = app.service('deportistas');

    assert.ok(service, 'Registered the service');
  });
});
