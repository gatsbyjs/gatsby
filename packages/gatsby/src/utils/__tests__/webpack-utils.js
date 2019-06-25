const utils = require(`../webpack-utils`)

let config
beforeAll(async () => {
  config = await utils({
    stage: `develop`,
    program: {
      browserslist: [],
    },
  })
})

describe(`webpack utils`, () => {
  describe(`js`, () => {
    it(`adds .js rule`, () => {
      expect(config.rules.js).toEqual(expect.any(Function))
    })

    it(`returns correct rule`, () => {
      const rule = config.rules.js()

      expect(rule).toMatchSnapshot()
    })
  })
})
