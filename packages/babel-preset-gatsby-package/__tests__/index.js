const preset = require(`../`)

jest.mock(`../resolver`, () => jest.fn(moduleName => moduleName))

describe(`babel-preset-gatsby-package`, () => {
  describe(`in node mode`, () => {
    it(`specifies the proper plugins`, () => {
      const { plugins } = preset()
      expect(plugins).toMatchSnapshot()
    })

    it(`specifies proper presets`, () => {
      const { presets } = preset()
      expect(presets).toMatchSnapshot()
    })

    it(`specifies proper presets for debugging`, () => {
      const { presets } = preset(null, { debug: true })
      expect(presets).toMatchSnapshot()
    })

    it(`specifies proper presets for production`, () => {
      const currentBabelEnv = process.env.BABEL_ENV
      process.env.BABEL_ENV = `production`
      let presets

      try {
        const config = preset(null)
        presets = config.presets
      } finally {
        process.env.BABEL_ENV = currentBabelEnv
      }

      expect(presets).toMatchSnapshot()
    })
  })

  describe(`in browser mode`, () => {
    it(`specifies the proper plugins`, () => {
      const { plugins } = preset(null, { browser: true })
      expect(plugins).toMatchSnapshot()
    })

    it(`specifies proper presets`, () => {
      const { presets } = preset(null, { browser: true })
      expect(presets).toMatchSnapshot()
    })

    it(`specifies proper presets for debugging`, () => {
      const { presets } = preset(null, { browser: true, debug: true })
      expect(presets).toMatchSnapshot()
    })

    it(`specifies proper presets for production`, () => {
      const currentBabelEnv = process.env.BABEL_ENV
      process.env.BABEL_ENV = `production`
      let presets

      try {
        const config = preset(null, { browser: true })
        presets = config.presets
      } finally {
        process.env.BABEL_ENV = currentBabelEnv
      }

      expect(presets).toMatchSnapshot()
    })
  })
})
