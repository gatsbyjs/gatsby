import { Joi, ObjectSchema } from "gatsby-plugin-utils"
import { GatsbyNode } from "../.."
import { getConfigFile } from "../bootstrap/get-config-file"

export const getPluginOptionsSchema = async (
  pluginName: string
): Promise<ObjectSchema | null> => {
  const { configModule } = await getConfigFile(pluginName, `gatsby-node`)
  const gatsbyNode: GatsbyNode | null = configModule

  if (!gatsbyNode?.pluginOptionsSchema) {
    return null
  }

  const optionsSchema = gatsbyNode.pluginOptionsSchema({ Joi })

  // Validate correct usage of pluginOptionsSchema
  if (!Joi.isSchema(optionsSchema) || optionsSchema.type !== `object`) {
    return null
  }

  return optionsSchema
}
