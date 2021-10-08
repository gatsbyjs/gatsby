// @ts-check
const _ = require(`lodash`)

const { normalizeContentTypeItems } = require(`./normalize`)
const { createPluginConfig } = require(`./plugin-options`)
const { fetchContentTypes } = require(`./fetch`)

export async function createSchemaCustomization(
  { schema, actions, reporter },
  pluginOptions
) {
  const { createTypes } = actions

  const pluginConfig = createPluginConfig(pluginOptions)

  // Get content type items from Contentful
  const contentTypeItems = await fetchContentTypes({ pluginConfig, reporter })

  // Prepare content types
  normalizeContentTypeItems({
    contentTypeItems,
    pluginConfig,
    reporter,
  })

  createTypes(
    schema.buildObjectType({
      name: `ContentfulEntry`,
      fields: {
        contentful_id: { type: `String!` },
        id: { type: `ID!` },
        node_locale: { type: `String!` },
      },
      extensions: { dontInfer: {} },
      interfaces: [`Node`],
    })
  )

  createTypes(
    schema.buildObjectType({
      name: `ContentfulReference`,
      fields: {
        contentful_id: { type: `String!` },
        id: { type: `ID!` },
      },
      extensions: { dontInfer: {} },
    })
  )

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

  if (pluginConfig.get(`enableTags`)) {
    createTypes(
      schema.buildObjectType({
        name: `ContentfulTag`,
        fields: {
          name: { type: `String!` },
          contentful_id: { type: `String!` },
          id: { type: `ID!` },
        },
        interfaces: [`Node`],
        extensions: { dontInfer: {} },
      })
    )
  }
}
