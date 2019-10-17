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
      const loaders = {
        js: jest.fn(() => jsLoader),
      }
      const state = "develop"
      const eslintLoader = { loader: "eslint-loader" }
      webpackConfig = {
        module: {
          rules: [
            {
              enforce: `pre`,
              test: /\.jsx?$/,
              exclude: /(node_modules|bower_components)/,
              use: [eslintLoader],
            }
          ]
        }
      }
      const getConfig = jest.fn(() => webpackConfig)
      onCreateWebpackConfig({ actions, getConfig, loaders, state })
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
      expect(actions.setWebpackConfig).toHaveBeenCalledWith({
        module: {
          rules: [
            {
              enforce: `pre`,
              test: /\.tsx?$/,
              exclude: /(node_modules|bower_components)/,
              use: [eslintLoader],
            },
          ],
        },
      })
    })

    it(`does not set the webpack config if there isn't a js loader`, () => {
      const actions = { setWebpackConfig: jest.fn() }
      const eslintLoader = {}
      const loaders = {
        js: jest.fn(),
        eslint: jest.fn(() => eslintLoader),
      }
      const state = {}
      const store = { getState: jest.fn(() => state) }
      onCreateWebpackConfig({ actions, loaders, store })
      expect(actions.setWebpackConfig).not.toHaveBeenCalled()
    })

    it(`does not set the webpack config if there isn't an eslint loader`, () => {
      const actions = { setWebpackConfig: jest.fn() }
      const jsLoader = {}
      const loaders = {
        js: jest.fn(() => jsLoader),
        eslint: jest.fn(),
      }
      const state = {}
      const store = { getState: jest.fn(() => state) }
      onCreateWebpackConfig({ actions, loaders, store })
      expect(actions.setWebpackConfig).not.toHaveBeenCalled()
    })
  })
})
