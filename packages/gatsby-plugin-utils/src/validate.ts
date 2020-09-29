import { Schema } from "joi"

export function validateOptionsSchema<Options = object>(
  pluginSchema: Schema,
  pluginOptions: Options
): Options {
  const result = pluginSchema.validate(pluginOptions)
  // TODO: Better error system
  if (result.error) throw result.error

  return result.value
}
