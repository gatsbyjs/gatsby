/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { validateOptionsSchema, Joi } from "../"

it(`validates a basic schema`, async () => {
  const pluginSchema = Joi.object({
    str: Joi.string(),
  })

  const validOptions = {
    str: `is a string`,
  }
  expect(await validateOptionsSchema(pluginSchema, validOptions)).toEqual(
    validOptions
  )

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

it(`throws an error on unknown values`, async () => {
  const schema = Joi.object({
    str: Joi.string(),
  })

  const invalid = () =>
    validateOptionsSchema(schema, {
      str: `bla`,
      notInSchema: true,
    })

  expect(invalid()).rejects.toThrowErrorMatchingInlineSnapshot(
    `"\\"notInSchema\\" is not allowed"`
  )
})
