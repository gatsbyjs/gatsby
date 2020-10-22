import { ValidationOptions } from "joi"
import { ObjectSchema } from "./joi"
import { IPluginInfoOptions } from "./types"

const validationOptions: ValidationOptions = {
  // Show all errors at once, rather than only the first one every time
  abortEarly: false,
  cache: true,
}

interface IOptions {
  validateExternalRules?: boolean
}

export async function validateOptionsSchema(
  pluginSchema: ObjectSchema,
  pluginOptions: IPluginInfoOptions,
  options: IOptions = {
    validateExternalRules: true,
  }
): Promise<IPluginInfoOptions> {
  const { validateExternalRules } = options

  const value = await pluginSchema.validateAsync(pluginOptions, {
    ...validationOptions,
    externals: validateExternalRules,
  })

  return value
}
