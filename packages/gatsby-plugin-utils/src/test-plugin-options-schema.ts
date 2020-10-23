import { Joi } from "./joi"
import { GatsbyNode } from "gatsby"
import { validateOptionsSchema } from "./validate"
import { IPluginInfoOptions } from "./types"

interface ITestPluginOptionsSchemaReturnType {
  errors: Array<string>
  isValid: boolean
}

export async function testPluginOptionsSchema(
  pluginSchemaFunction: Exclude<GatsbyNode["pluginOptionsSchema"], undefined>,
  pluginOptions: IPluginInfoOptions
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
