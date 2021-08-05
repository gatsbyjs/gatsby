const preset = require(`../src/index.js`)

jest.mock(`../src/resolver`, () => jest.fn(moduleName => moduleName))


describe(`babel-preset-gatsby-package`, () => {
  let babelEnv;

  beforeEach(() => {
    babelEnv = process.env.BABEL_ENV
    delete process.env.BABEL_ENV;
  })

  afterEach(() => {
    process.env.BABEL_ENV = babelEnv
  })

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

      const [, opts] = presets.find(preset => [].concat(preset).includes(`@babel/preset-env`))

      expect(opts.targets.node).toBe(nodeVersion)
    })

    it(`can enable compilerFlags`, () => {
      const { plugins } = preset(null, { availableCompilerFlags: [`MAJOR`] })
      expect(plugins).toMatchSnapshot()
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

    it(`specifies proper presets for esm`, () => {
      const { presets } = preset(null, { browser: true, esm: true })
      expect(presets).toMatchSnapshot()
    })
  })
})
