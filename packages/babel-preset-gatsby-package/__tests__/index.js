const preset = require(`../`)

jest.mock(`../resolver`, () => jest.fn(moduleName => moduleName))

beforeEach(() => {
  delete process.env.BABEL_ENV
})

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

    it(`can pass custom nodeVersion target`, () => {
      const nodeVersion = `6.0`
      const { presets } = preset(null, {
        nodeVersion,
      })

      const [, opts] = presets.find(preset =>
        [].concat(preset).includes(`@babel/preset-env`)
      )

      expect(opts.targets.node).toBe(nodeVersion)
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
  })
})
