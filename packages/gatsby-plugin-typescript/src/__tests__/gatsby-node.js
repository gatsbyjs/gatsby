const {
  resolvableExtensions,
  onCreateBabelConfig,
  onCreateWebpackConfig,
} = require(`../gatsby-node`)
const path = require(`path`)

const { testPluginOptionsSchema } = require(`gatsby-plugin-utils`)
const { pluginOptionsSchema } = require(`../gatsby-node`)

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
      const loaders = { js: jest.fn(() => {}) }
      onCreateWebpackConfig({ actions, loaders })
      expect(actions.setWebpackConfig).toHaveBeenCalledWith({
        module: {
          rules: [
            {
              test: /\.tsx?$/,
              use: expect.toBeFunction(),
            },
          ],
        },
      })
    })

    it(`does not set the webpack config if there isn't a js loader`, () => {
      const actions = { setWebpackConfig: jest.fn() }
      const loaders = { js: undefined }
      onCreateWebpackConfig({ actions, loaders })
      expect(actions.setWebpackConfig).not.toHaveBeenCalled()
    })
  })

  describe(`plugin schema`, () => {
    it(`should provide meaningful errors when fields are invalid`, async () => {
      const expectedErrors = [
        `"isTSX" must be a boolean`,
        `"jsxPragma" must be a string`,
        `"allExtensions" must be a boolean`,
      ]

      const { isValid, errors } = await testPluginOptionsSchema(
        pluginOptionsSchema,
        {
          isTSX: `this should be a boolean`,
          jsxPragma: 123,
          allExtensions: `this should be a boolean`,
        }
      )

      expect(isValid).toBe(false)
      expect(errors).toEqual(expectedErrors)
    })

    it(`should validate the schema`, async () => {
      const { isValid, errors } = await testPluginOptionsSchema(
        pluginOptionsSchema,
        {
          isTSX: false,
          jsxPragma: `ReactFunction`,
          allExtensions: false,
          allowNamespaces: false,
          allowDeclareFields: false,
          onlyRemoveTypeImports: false,
        }
      )

      expect(isValid).toBe(true)
      expect(errors).toEqual([])
    })

    it(`should break when isTSX doesn't match allExtensions`, async () => {
      const expectedErrors = [`"allExtensions" must be [true]`]

      const { isValid, errors } = await testPluginOptionsSchema(
        pluginOptionsSchema,
        {
          isTSX: true,
          jsxPragma: `ReactFunction`,
          allExtensions: false,
        }
      )

      expect(isValid).toBe(false)
      expect(errors).toEqual(expectedErrors)
    })
  })
})
