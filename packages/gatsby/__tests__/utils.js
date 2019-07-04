const utils = require('../utils');

describe('utils', () => {
  it('exports the correct public api', () => {
    expect(typeof utils.createContentDigest).toBe('function')
    expect(typeof utils.joinPath).toBe('function')
  })
})