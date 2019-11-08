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
    it(`sets the correct babel preset and plugin`, () => {
      const actions = { setBabelPreset: jest.fn(), setBabelPlugin: jest.fn() }
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
      expect(actions.setBabelPlugin).toHaveBeenCalledTimes(2)
      expect(actions.setBabelPlugin).toHaveBeenCalledWith({
        name: expect.stringContaining(
          path.join(`@babel`, `plugin-proposal-optional-chaining`)
        ),
      })
      expect(actions.setBabelPlugin).toHaveBeenCalledWith({
        name: expect.stringContaining(
          path.join(`@babel`, `plugin-proposal-nullish-coalescing-operator`)
        ),
      })
    })
  })

  describe(`onCreateWebpackConfig`, () => {
    it(`sets the correct webpack config`, () => {
      const actions = { setWebpackConfig: jest.fn() }
      const jsLoader = {}
      const loaders = { js: jest.fn(() => jsLoader) }
      onCreateWebpackConfig({ actions, loaders })
      expect(actions.setWebpackConfig).toHaveBeenCalledWith({
        module: {
          rules: [
            {
              test: /\.tsx?$/,
              use: jsLoader,
            },
          ],
        },
      })
    })

    it(`does not set the webpack config if there isn't a js loader`, () => {
      const actions = { setWebpackConfig: jest.fn() }
      const loaders = { js: jest.fn() }
      onCreateWebpackConfig({ actions, loaders })
      expect(actions.setWebpackConfig).not.toHaveBeenCalled()
    })
  })
})
