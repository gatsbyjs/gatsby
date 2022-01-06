/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { validateOptionsSchema, Joi } from "../"
import { testPluginOptionsSchema } from "../test-plugin-options-schema"

it(`validates a basic schema`, async () => {
  const pluginSchema = Joi.object({
    str: Joi.string(),
  })

  const validOptions = {
    str: `is a string`,
  }

  const { value } = await validateOptionsSchema(pluginSchema, validOptions)
  expect(value).toEqual(validOptions)

  const invalid = () =>
    validateOptionsSchema(pluginSchema, {
      str: 43,
    })

  expect(invalid()).rejects.toThrowErrorMatchingInlineSnapshot(
    `"\\"str\\" must be a string"`
  )
})

it(`asynchronously validates the external validation rules`, () => {
  const failingAsyncValidationRule = async () => {
    throw new Error(`This failed for some unknown reason.`)
  }

  const schema = Joi.object({}).external(failingAsyncValidationRule)

  const invalid = () => validateOptionsSchema(schema, {})

  expect(invalid()).rejects.toThrowErrorMatchingInlineSnapshot(
    `"This failed for some unknown reason. (value)"`
  )
})

it(`does not validate async external validation rules when validateExternalRules is set to false`, async () => {
  const failingAsyncValidationRule = async () => {
    throw new Error(`This failed for some unknown reason.`)
  }

  const schema = Joi.object({}).external(failingAsyncValidationRule)

  const invalid = () =>
    validateOptionsSchema(
      schema,
      {},
      {
        validateExternalRules: false,
      }
    )

  expect(invalid).not.toThrowError()
})

it(`throws an warning on unknown values`, async () => {
  const schema = Joi.object({
    str: Joi.string(),
  })

  const validWarnings = [`"notInSchema" is not allowed`]

  const { hasWarnings, warnings } = await testPluginOptionsSchema(
    () => schema,
    {
      str: `bla`,
      notInSchema: true,
    }
  )

  expect(hasWarnings).toBe(true)
  expect(warnings).toEqual(validWarnings)
})

it(`populates default values`, async () => {
  const pluginSchema = Joi.object({
    str: Joi.string(),
    default: Joi.string().default(`default`),
  })

  const validOptions = {
    str: `is a string`,
  }

  const { value } = await validateOptionsSchema(pluginSchema, validOptions)
  expect(value).toEqual({
    ...validOptions,
    default: `default`,
  })
})
