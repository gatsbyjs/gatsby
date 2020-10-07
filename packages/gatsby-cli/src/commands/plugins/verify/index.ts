import path from "path"
import { validateOptionsSchema, Joi } from "gatsby-plugin-utils"
import {
  GatsbyNodeNotFound,
  InvalidPluginOptionType,
  JoiSchemaError,
  PluginOptionsSchemaNotFound,
} from "./types"

const resolveGatsbyNode = (): any => {
  try {
    return require(path.join(process.cwd(), `gatsby-node.js`))
  } catch (e) {
    if (e.code === `MODULE_NOT_FOUND`) {
      throw new GatsbyNodeNotFound()
    }

    throw e
  }
}

const resolvePluginOptionsSchema = (gatsbyNode): Joi.Schema => {
  if (!gatsbyNode.pluginOptionsSchema) {
    throw new PluginOptionsSchemaNotFound()
  }

  const pluginOptionsSchemaType = typeof gatsbyNode.pluginOptionsSchema

  if (pluginOptionsSchemaType !== `function`) {
    throw new InvalidPluginOptionType(pluginOptionsSchemaType)
  }

  return gatsbyNode.pluginOptionsSchema
}

const validateJoiSchema = async (schema: Joi.Schema): Promise<void> => {
  try {
    await validateOptionsSchema(schema, {})
  } catch (e) {
    throw new JoiSchemaError(e.message)
  }
}

export const verifyCommand = async (): Promise<string | void> => {
  try {
    const gatsbyNode = resolveGatsbyNode()
    const pluginOptionsSchema = resolvePluginOptionsSchema(gatsbyNode)
    const schema = pluginOptionsSchema({ Joi })

    return await validateJoiSchema(schema)
  } catch (e) {
    if (
      e instanceof GatsbyNodeNotFound ||
      e instanceof PluginOptionsSchemaNotFound ||
      e instanceof InvalidPluginOptionType ||
      e instanceof JoiSchemaError
    ) {
      return e.message
    }

    return `\n⚠️  An error occurred that we don't have control over: ${e.message}.`
  }
}
