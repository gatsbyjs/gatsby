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

    it(`returns default values without any options`, () => {
      const rule = config.rules.js()

      expect(rule).toMatchSnapshot()
    })

    it(`returns the correct exclude paths`, () => {
      const rule = config.rules.js({
        exclude: [`node_modules`],
      })

      expect(rule).toMatchSnapshot()
    })
  })
})
