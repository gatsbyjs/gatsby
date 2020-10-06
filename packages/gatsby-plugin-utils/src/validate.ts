import { BaseValidationOptions } from "joi"
import { ObjectSchema } from "./utils/plugin-options-schema-joi-type"

const validationOptions: BaseValidationOptions = {
  // Show all errors at once, rather than only the first one every time
  abortEarly: false,
  cache: true,
}

interface IOptions {
  validateExternalRules?: boolean
}

export async function validateOptionsSchema<PluginOptions = object>(
  pluginSchema: ObjectSchema,
  pluginOptions: PluginOptions,
  options: IOptions = {}
): Promise<PluginOptions> {
  if (options.validateExternalRules === false) {
    const result = pluginSchema.validate(pluginOptions, {
      ...validationOptions,
      externals: false,
    })
    if (result.error) throw result.error
    return result.value
  }

  return pluginSchema.validateAsync(pluginOptions, validationOptions)
}
