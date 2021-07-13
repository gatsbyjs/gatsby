const _ = require(`lodash`)

const { createPluginConfig } = require(`./plugin-options`)

export async function createSchemaCustomization(
  { schema, actions, cache },
  pluginOptions
) {
  const { createTypes } = actions

  const pluginConfig = createPluginConfig(pluginOptions)
  const sourceId = `${pluginConfig.get(`spaceId`)}-${pluginConfig.get(
    `environment`
  )}`

  const { contentTypeItems } = await cache.get(
    `contentful-sync-result-${sourceId}`
  )

  createTypes(`
    interface ContentfulEntry implements Node {
      contentful_id: String!
      id: ID!
      node_locale: String!
    }
  `)

  createTypes(`
    interface ContentfulReference {
      contentful_id: String!
      id: ID!
    }
  `)

  createTypes(
    schema.buildObjectType({
      name: `ContentfulAsset`,
      fields: {
        contentful_id: { type: `String!` },
        id: { type: `ID!` },
      },
      interfaces: [`ContentfulReference`, `Node`],
    })
  )

  // Create types for each content type
  const gqlTypes = contentTypeItems.map(contentTypeItem =>
    schema.buildObjectType({
      name: _.upperFirst(
        _.camelCase(
          `Contentful ${
            pluginConfig.get(`useNameForId`)
              ? contentTypeItem.name
              : contentTypeItem.sys.id
          }`
        )
      ),
      fields: {
        contentful_id: { type: `String!` },
        id: { type: `ID!` },
        node_locale: { type: `String!` },
      },
      interfaces: [`ContentfulReference`, `ContentfulEntry`, `Node`],
    })
  )

  createTypes(gqlTypes)
}
