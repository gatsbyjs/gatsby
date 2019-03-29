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
  describe(`mjs`, () => {
    it(`adds .mjs rule`, () => {
      expect(config.rules.mjs).toEqual(expect.any(Function))
    })

    it(`returns correct rule`, () => {
      const rule = config.rules.mjs()

      expect(rule).toEqual({
        include: /node_modules/,
        test: /\.mjs$/,
        type: `javascript/auto`,
      })
    })
  })
})
