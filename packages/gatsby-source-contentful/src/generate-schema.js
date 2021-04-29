import { makeTypeName } from "./normalize"

// Contentful content type schemas
const ContentfulDataTypes = new Map([
  [
    `Symbol`,
    () => {
      return { type: `String` }
    },
  ],
  [
    `Text`,
    field => {
      return {
        type: `ContentfulNodeTypeText`,
        extensions: {
          link: { by: `id`, from: `${field.id}___NODE` },
        },
      }
    },
  ],
  [
    `Integer`,
    () => {
      return { type: `Int` }
    },
  ],
  [
    `Number`,
    () => {
      return { type: `Float` }
    },
  ],
  [
    `Date`,
    () => {
      return {
        type: `Date`,
        extensions: {
          dateformat: {},
        },
      }
    },
  ],
  [
    `Object`,
    () => {
      return { type: `JSON` }
    },
  ],
  [
    `Boolean`,
    () => {
      return { type: `Boolean` }
    },
  ],
  [
    `Location`,
    () => {
      return { type: `ContentfulNodeTypeLocation` }
    },
  ],
  [
    `RichText`,
    () => {
      return { type: `ContentfulNodeTypeRichText` }
    },
  ],
])

const getLinkFieldType = (linkType, field) => {
  return {
    type: `Contentful${linkType}`,
    extensions: {
      link: { by: `id`, from: `${field.id}___NODE` },
    },
  }
}

const translateFieldType = field => {
  let fieldType
  if (field.type === `Array`) {
    // Arrays of Contentful Links or primitive types
    const fieldData =
      field.items.type === `Link`
        ? getLinkFieldType(field.items.linkType, field)
        : translateFieldType(field.items)

    fieldType = { ...fieldData, type: `[${fieldData.type}]` }
  } else if (field.type === `Link`) {
    // Contentful Link (reference) field types
    fieldType = getLinkFieldType(field.linkType, field)
  } else {
    // Primitive field types
    fieldType = ContentfulDataTypes.get(field.type)(field)
  }

  if (field.required) {
    fieldType.type = `${fieldType.type}!`
  }

  return fieldType
}

function generateAssetTypes({ createTypes }) {
  createTypes(`
    type ContentfulAsset implements ContentfulInternalReference & Node {
      sys: ContentfulInternalSys
      id: ID!
      title: String
      description: String
      contentType: String
      fileName: String
      url: String
      size: Int
      width: Int
      height: Int
    }
  `)
}

export function generateSchema({
  createTypes,
  schema,
  pluginConfig,
  contentTypeItems,
}) {
  createTypes(`
    interface ContentfulInternalReference implements Node {
      id: ID!
      sys: ContentfulInternalSys
    }
  `)

  createTypes(`
    type ContentfulContentType implements Node {
      id: ID!
      name: String!
      displayField: String!
      description: String!
    }
  `)

  createTypes(`
    type ContentfulInternalSys @dontInfer {
      type: String!
      id: String!
      spaceId: String!
      environmentId: String!
      contentType: ContentfulContentType @link(by: "id", from: "contentType___NODE")
      firstPublishedAt: Date!
      publishedAt: Date!
      publishedVersion: Int!
      locale: String!
    }
  `)

  createTypes(`
    interface ContentfulEntry implements Node @dontInfer {
      id: ID!
      sys: ContentfulInternalSys
    }
  `)

  generateAssetTypes({ createTypes })

  // Contentful specific types
  createTypes(
    schema.buildObjectType({
      name: `ContentfulNodeTypeRichText`,
      fields: {
        raw: {
          type: `JSON`,
          resolve(source) {
            return source
          },
        },
        references: {
          type: `[ContentfulInternalReference]`,
          resolve(source, args, context) {
            const referencedEntries = new Set()
            const referencedAssets = new Set()

            // Locate all Contentful Links within the rich text data
            // Traverse logic based on https://github.com/contentful/contentful-resolve-response
            const traverse = obj => {
              // eslint-disable-next-line guard-for-in
              for (const k in obj) {
                const v = obj[k]
                if (v && v.sys && v.sys.type === `Link`) {
                  if (v.sys.linkType === `Asset`) {
                    referencedAssets.add(v.sys.id)
                  }
                  if (v.sys.linkType === `Entry`) {
                    referencedEntries.add(v.sys.id)
                  }
                } else if (v && typeof v === `object`) {
                  traverse(v)
                }
              }
            }
            traverse(source)

            // Get all nodes and return all that got referenced in the rich text
            return context.nodeModel.getAllNodes().filter(node => {
              if (
                !(
                  node.internal.owner === `gatsby-source-contentful` &&
                  node?.sys?.id
                )
              ) {
                return false
              }
              return node.internal.type === `ContentfulAsset`
                ? referencedAssets.has(node.sys.id)
                : referencedEntries.has(node.sys.id)
            })
          },
        },
      },
      extensions: { dontInfer: {} },
    })
  )

  createTypes(
    schema.buildObjectType({
      name: `ContentfulNodeTypeLocation`,
      fields: {
        lat: { type: `Float!` },
        lon: { type: `Float!` },
      },
      extensions: {
        dontInfer: {},
      },
    })
  )

  // @todo Is there a way to have this as string and let transformer-remark replace it with an object?
  createTypes(
    schema.buildObjectType({
      name: `ContentfulNodeTypeText`,
      fields: {
        raw: `String!`,
      },
      interfaces: [`Node`],
      extensions: {
        dontInfer: {},
      },
    })
  )

  for (const contentTypeItem of contentTypeItems) {
    try {
      const fields = {}
      contentTypeItem.fields.forEach(field => {
        if (field.disabled || field.omitted) {
          return
        }
        fields[field.id] = translateFieldType(field)
      })

      const type = pluginConfig.get(`useNameForId`)
        ? contentTypeItem.name
        : contentTypeItem.sys.id

      createTypes(
        schema.buildObjectType({
          name: makeTypeName(type),
          fields: {
            id: { type: `ID!` },
            sys: { type: `ContentfulInternalSys` },
            ...fields,
          },
          interfaces: [
            `ContentfulInternalReference`,
            `ContentfulEntry`,
            `Node`,
          ],
          extensions: { dontInfer: {} },
        })
      )
    } catch (err) {
      err.message = `Unable to create schema for Contentful Content Type ${
        contentTypeItem.name || contentTypeItem.sys.id
      }:\n${err.message}`
      console.log(err.stack)
      throw err
    }
  }
}
