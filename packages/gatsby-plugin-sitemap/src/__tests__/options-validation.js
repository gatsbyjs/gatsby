import { pluginOptionsSchema } from "../options-validation"
import Joi from "joi"

const schema = pluginOptionsSchema({ Joi })

describe(`gatsby-plugin-sitemap: options-validation tests`, () => {
  describe(`validateOptions`, () => {
    it(`creates correct defaults`, async () => {
      const pluginOptions = await schema.validateAsync({})

      expect(pluginOptions).toMatchSnapshot()
    })

    it(`errors on invalid options`, async () => {
      try {
        await schema.validateAsync({ wrong: `test` })
      } catch (error) {
        expect(error).toMatchSnapshot()
      }
    })
  })
})
