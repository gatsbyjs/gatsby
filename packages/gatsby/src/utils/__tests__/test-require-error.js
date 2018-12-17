const testRequireError = require(`../test-require-error`).default

describe(`test-require-error`, () => {
  it(`detects require errors`, () => {
    try {
      require(`./fixtures/module-does-not-exist`)
    } catch (err) {
      expect(testRequireError(`./fixtures/module-does-not-exist`, err)).toEqual(
        true
      )
    }
  })
  it(`detects require errors when using windows path`, () => {
    try {
      require(`.\\fixtures\\module-does-not-exist`)
    } catch (err) {
      expect(
        testRequireError(`.\\fixtures\\module-does-not-exist`, err)
      ).toEqual(true)
    }
  })
  it(`Only returns true on not found errors for actual module not "not found" errors of requires inside the module`, () => {
    try {
      require(`./fixtures/bad-module-require`)
    } catch (err) {
      expect(testRequireError(`./fixtures/bad-module-require`, err)).toEqual(
        false
      )
    }
  })
  it(`ignores other errors`, () => {
    try {
      require(`./fixtures/bad-module-syntax`)
    } catch (err) {
      expect(testRequireError(`./fixtures/bad-module-syntax`, err)).toEqual(
        false
      )
    }
  })
})
