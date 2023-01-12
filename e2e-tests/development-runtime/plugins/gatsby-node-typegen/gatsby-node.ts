import { GatsbyNode } from "gatsby"

// This isn't strictly relevant for typegen but I'm lazy...
// By adding the schema here and re-using it inside createSchemaCustomization we can make sure that Gatsby correctly reads the pluginOptionsSchema from .ts files. If it wouldn't work the checkMePleaseKey would be undefined and the e2e test would fail
export const pluginOptionsSchema: GatsbyNode["pluginOptionsSchema"] = ({ Joi }) => {
  return Joi.object({
    checkMePleaseString: Joi.string().default(`hello`)
  })
}

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = ({ actions }, pluginOptions) => {
  const { createTypes } = actions
  const checkMePleaseKey = pluginOptions?.checkMePleaseString

  createTypes(`
    type CheckMePlease {
      ${checkMePleaseKey}: String!
    }
  `)
}

export const createPages: GatsbyNode["createPages"] = async ({ graphql }) => {
  await graphql<Queries.GatsbyNodeQuery>(`#graphql
    query GatsbyNode {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)
}