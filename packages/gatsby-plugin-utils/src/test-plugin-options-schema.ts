import Joi from "joi"
import { ObjectSchema } from "./utils/plugin-options-schema-joi-type"

type PluginSchemaFunction = ({ Joi }) => ObjectSchema

export function testPluginOptionsSchema<PluginOptions = object>(
  pluginSchemaFunction: PluginSchemaFunction,
  pluginOptions: PluginOptions
): void {
  const pluginOptionsNames = Object.keys(pluginOptions)
  const pluginSchema = pluginSchemaFunction({ Joi })
  const errors: Array<string> = []

  pluginOptionsNames.forEach(pluginOptionName => {
    const partialSchema = pluginSchema.extract(pluginOptionName)

    const { error } = partialSchema.validate(pluginOptions[pluginOptionName], {
      abortEarly: false,
    })

    if (error) {
      const errorMessage = error.message

      // In the case of an array, "value" does not exist in the error message
      // and so we can't replace it with the plugin option name, we have to concat it
      const message = errorMessage.includes(`"value"`)
        ? errorMessage.replace(`"value"`, `"${pluginOptionName}"`)
        : `"${pluginOptionName}" ${errorMessage}`

      errors.push(message)
    }
  })

  if (errors.length > 0) {
    throw new Error(`Schema validation failed for the following reasons:

      - ${errors.join(`\n      - `)}
    `)
  }
}
