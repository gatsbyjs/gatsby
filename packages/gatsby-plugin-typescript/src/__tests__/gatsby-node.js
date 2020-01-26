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
      expect(actions.setBabelPlugin).toHaveBeenCalledTimes(3)
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
      expect(actions.setBabelPlugin).toHaveBeenCalledWith({
        name: expect.stringContaining(
          path.join(`@babel`, `plugin-proposal-numeric-separator`)
        ),
      })
    })
  })

  describe(`onCreateWebpackConfig`, () => {
    it(`sets the correct webpack config`, () => {
      const actions = { setWebpackConfig: jest.fn() }
      const jsLoader = {}
      const loaders = { js: jest.fn(() => jsLoader) }
      const stage = `develop`
      const eslintLoader = { loader: `eslint-loader` }
      const webpackConfig = {
        module: {
          rules: [
            {
              enforce: `pre`,
              test: /\.jsx?$/,
              exclude: /(node_modules|bower_components)/,
              use: [eslintLoader],
            },
          ],
        },
      }
      const getConfig = jest.fn(() => webpackConfig)
      onCreateWebpackConfig({ actions, getConfig, loaders, stage })
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
      const loaders = { js: jest.fn() }
      const stage = `develop`
      const getConfig = jest.fn()
      onCreateWebpackConfig({ actions, getConfig, loaders, stage })
      expect(actions.setWebpackConfig).not.toHaveBeenCalled()
    })

    it(`does not set the typescript-eslint webpack config if the built-in eslint-loader isn't set`, () => {
      const actions = { setWebpackConfig: jest.fn() }
      const jsLoader = {}
      const loaders = {
        js: jest.fn(() => jsLoader),
      }
      const stage = `develop`
      const webpackConfig = {
        module: {
          rules: [
            {
              enforce: `pre`,
              test: /\.jsx?$/,
              exclude: /(node_modules|bower_components)/,
              use: [],
            },
          ],
        },
      }
      const getConfig = jest.fn(() => webpackConfig)
      onCreateWebpackConfig({ actions, getConfig, loaders, stage })
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
      expect(actions.setWebpackConfig).not.toHaveBeenCalledWith({
        module: {
          rules: [
            {
              enforce: `pre`,
              test: /\.tsx?$/,
              exclude: /(node_modules|bower_components)/,
              use: [],
            },
          ],
        },
      })
    })

    it(`set the typescript-eslint webpack config only if in develop stage`, () => {
      const actions = { setWebpackConfig: jest.fn() }
      const jsLoader = {}
      const loaders = { js: jest.fn(() => jsLoader) }
      const stage = `build-html`
      const eslintLoader = { loader: `eslint-loader` }
      const webpackConfig = {
        module: {
          rules: [
            {
              enforce: `pre`,
              test: /\.jsx?$/,
              exclude: /(node_modules|bower_components)/,
              use: [eslintLoader],
            },
          ],
        },
      }
      const getConfig = jest.fn(() => webpackConfig)
      onCreateWebpackConfig({ actions, getConfig, loaders, stage })
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
      expect(actions.setWebpackConfig).not.toHaveBeenCalledWith({
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
  })
})
