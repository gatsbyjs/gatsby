import Joi from "joi"
import { validateOptionsSchema } from "../"

it(`validates a basic schema`, async () => {
  const pluginSchema = Joi.object({
    str: Joi.string(),
  })

  const validOptions = {
    str: `is a string`,
  }
  expect(validateOptionsSchema(pluginSchema, validOptions)).toEqual(
    validOptions
  )

  expect(() =>
    validateOptionsSchema(pluginSchema, {
      str: 43,
    })
  ).toThrowErrorMatchingInlineSnapshot(`"\\"str\\" must be a string"`)
})
