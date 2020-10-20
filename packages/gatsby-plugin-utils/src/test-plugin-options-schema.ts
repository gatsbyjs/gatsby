import { Joi } from "./joi"
import { GatsbyNode } from "gatsby"
import { validateOptionsSchema } from "./validate"

interface ITestPluginOptionsSchemaReturnType {
  errors: Array<string>
  isValid: boolean
}

export async function testPluginOptionsSchema<PluginOptions = object>(
  pluginSchemaFunction: Exclude<GatsbyNode["pluginOptionsSchema"], undefined>,
  pluginOptions: PluginOptions
): Promise<ITestPluginOptionsSchemaReturnType> {
  const pluginSchema = pluginSchemaFunction({ Joi })

  try {
    await validateOptionsSchema(pluginSchema, pluginOptions)
  } catch (e) {
    const errors = e.details.map(detail => detail.message)
    return { isValid: false, errors }
  }

  return { isValid: true, errors: [] }
}
