import { validateOptions, validateOptionsSsr } from "../options-validation"

describe(`gatsby-plugin-sitemap: options-validation tests`, () => {
  describe(`validateOptions`, () => {
    it(`creates correct defaults`, async () => {
      const pluginOptions = await validateOptions({})

      expect(pluginOptions).toMatchSnapshot()
    })

    it(`errors on invalid options`, async () => {
      try {
        await validateOptions({ wrong: `test` })
      } catch (error) {
        expect(error).toMatchSnapshot()
      }
    })
  })
  describe(`validateOptionsSsr`, () => {
    it(`creates correct defaults`, () => {
      const pluginOptions = validateOptionsSsr({})

      expect(pluginOptions).toMatchSnapshot()
    })

    it(`removes unknown options`, () => {
      const pluginOptions = validateOptionsSsr({ wrong: `test` })

      expect(pluginOptions).not.toHaveProperty(`wrong`)
    })
  })
})
