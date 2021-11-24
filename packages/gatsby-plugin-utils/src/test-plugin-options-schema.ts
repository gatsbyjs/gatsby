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
  const pluginSchema = pluginSchemaFunction({
    Joi: Joi.extend(joi => {
      return {
        type: `subPlugins`,
        base: joi
          .array()
          .items(
            joi.alternatives(
              joi.string(),
              joi.object({
                resolve: Joi.string(),
                options: Joi.object({}).unknown(true),
              })
            )
          )
          .custom(
            arrayValue =>
              arrayValue.map(value => {
                if (typeof value === `string`) {
                  value = { resolve: value }
                }

                return value
              }),
            `Gatsby specific subplugin validation`
          )
          .default([]),
      }
    }),
  })

  try {
    await validateOptionsSchema(pluginSchema, pluginOptions)
  } catch (e) {
    const errors = e.details.map(detail => detail.message)
    return { isValid: false, errors }
  }

  return { isValid: true, errors: [] }
}
