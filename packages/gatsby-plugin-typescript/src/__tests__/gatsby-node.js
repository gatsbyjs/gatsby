const {
  resolvableExtensions,
  onCreateBabelConfig,
  onCreateWebpackConfig,
} = require(`../gatsby-node`)
const path = require(`path`)

describe(`gatsby-plugin-typescript`, () => {
  describe(`resolvableExtensions`, () => {
    it(`returns the correct resolvable extensions`, () => {
      expect(resolvableExtensions()).toEqual([`.ts`, `.tsx`])
    })
  })

  describe(`onCreateBabelConfig`, () => {
    it(`sets the correct babel preset`, () => {
      const actions = { setBabelPreset: jest.fn() }
      const options = {
        isTSX: true,
        jsxPragma: `jsx`,
        allExtensions: true,
      }
      onCreateBabelConfig({ actions }, options)
      expect(actions.setBabelPreset).toHaveBeenCalledWith({
        name: expect.stringContaining(path.join(`@babel`, `preset-typescript`)),
        options,
      })
    })
  })

  describe(`onCreateWebpackConfig`, () => {
    it(`sets the correct webpack config`, () => {
      const actions = { setWebpackConfig: jest.fn() }
      const jsLoader = {}
      const eslintLoader = {}
      const loaders = {
        js: jest.fn(() => jsLoader),
        eslint: jest.fn(() => eslintLoader),
      }
      const store = { getState: jest.fn() }
      onCreateWebpackConfig({ actions, loaders, store })
      expect(actions.setWebpackConfig).toHaveBeenCalledWith({
        module: {
          rules: [
            {
              test: /\.tsx?$/,
              use: jsLoader,
            },
            {
              enforce: `pre`,
              test: /\.tsx?$/,
              exclude: /(node_modules|bower_components)/,
              use: eslintLoader,
            },
          ],
        },
      })
    })

    it(`does not set the webpack config if there isn't a js or eslint loader`, () => {
      const actions = { setWebpackConfig: jest.fn() }
      const loaders = { js: jest.fn(), eslint: jest.fn() }
      const store = { getState: jest.fn() }
      onCreateWebpackConfig({ actions, loaders, store })
      expect(actions.setWebpackConfig).not.toHaveBeenCalled()
    })
  })
})
