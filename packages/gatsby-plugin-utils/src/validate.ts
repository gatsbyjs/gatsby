import { BaseValidationOptions, Schema } from "joi"

const validationOptions: BaseValidationOptions = {
  // Show all errors at once, rather than only the first one every time
  abortEarly: false,
  cache: true,
  // Strip unknown values, this makes sure plugin authors define an extensive schema
  // TODO: Discuss whether we want this, maybe not a great developer experience...
  stripUnknown: true,
}

export async function validateOptionsSchema<Options = object>(
  pluginSchema: Schema,
  pluginOptions: Options,
  externalRules: boolean = true
): Promise<Options> {
  if (!externalRules) {
    const result = pluginSchema.validate(pluginOptions, {
      ...validationOptions,
      externals: false,
    })
    if (result.error) throw result.error
    return result.value
  }

  return await pluginSchema.validateAsync(pluginOptions, validationOptions)
}
