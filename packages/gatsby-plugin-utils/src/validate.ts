import { ValidationOptions } from "joi"
import { ObjectSchema, Joi } from "./joi"
import { IPluginInfoOptions } from "./types"

const validationOptions: ValidationOptions = {
  // Show all errors at once, rather than only the first one every time
  abortEarly: false,
  cache: true,
}

interface IOptions {
  validateExternalRules?: boolean
  returnWarnings?: boolean
}

interface IValidateAsyncResult {
  value: IPluginInfoOptions
  warning: {
    message: string
    details: Array<{
      message: string
      path: Array<string>
      type: string
      context: Array<Record<string, unknown>>
    }>
  }
}

export async function validateOptionsSchema(
  pluginSchema: ObjectSchema,
  pluginOptions: IPluginInfoOptions,
  options: IOptions = {
    validateExternalRules: true,
    returnWarnings: true,
  }
): Promise<IValidateAsyncResult> {
  const { validateExternalRules, returnWarnings } = options

  const warnOnUnknownSchema = pluginSchema.pattern(
    /.*/,
    Joi.any().warning(`any.unknown`)
  )

  return (await warnOnUnknownSchema.validateAsync(pluginOptions, {
    ...validationOptions,
    externals: validateExternalRules,
    warnings: returnWarnings,
  })) as Promise<IValidateAsyncResult>
}
