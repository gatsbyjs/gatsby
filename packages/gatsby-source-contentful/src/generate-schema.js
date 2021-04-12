const fs = require(`fs`)
const { cloneDeep } = require(`lodash`)

import { makeTypeName } from "./normalize"

const types = []

function generateAssetSchemas({ createTypes }) {
  createTypes(`
    type ContentfulAsset implements ContentfulReference & Node {
      file: ContentfulAssetFile
      title: String
      description: String
      node_locale: String
      sys: ContentfulAssetSys
      contentful_id: String!
      id: ID!
      spaceId: String!
      createdAt: String! # Date @dateform,
      updatedAt: String! # Date @dateform,
    }
  `)

  createTypes(`
    type ContentfulAssetFile @derivedTypes {
      url: String
      details: ContentfulAssetFileDetails
      fileName: String
      contentType: String
    }
  `)

  createTypes(`
    type ContentfulAssetFileDetails @derivedTypes {
      size: Int
      image: ContentfulAssetFileDetailsImage
    }
  `)

  createTypes(`
    type ContentfulAssetFileDetailsImage {
      width: Int
      height: Int
    }
  `)

  createTypes(`
    type ContentfulAssetSys {
      type: String
      revision: Int
    }
  `)
}

export function generateSchemas({
  createTypes,
  schema,
  pluginConfig,
  contentTypeItems,
}) {
  // logger @todo remove it
  const origTypes = createTypes
  createTypes = (...all) => {
    types.push(all)
    origTypes(...all)
  }

  createTypes(`
    interface ContentfulReference implements Node {
      contentful_id: String!
      id: ID!
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
    type ContentfulSys implements Node {
      id: ID!
      type: String
      revision: Int
      contentType: ContentfulContentType @link(by: "id", from: "contentType___NODE")
    }
  `)

  createTypes(`
    interface ContentfulEntry implements Node {
      contentful_id: String!
      id: ID!
      spaceId: String!
      sys: ContentfulSys @link(by: "id", from: "sys___NODE")
    }
  `)

  generateAssetSchemas({ createTypes })

  // Contentful specific types

  createTypes(
    schema.buildObjectType({
      name: `ContentfulNodeTypeRichText`,
      fields: {
        raw: { type: `String!` },
        references: { type: `ContentfulReference` },
      },
      interfaces: [`Node`],
    })
  )

  createTypes(
    schema.buildObjectType({
      name: `ContentfulNodeTypeLocation`,
      fields: {
        lat: { type: `Float!` },
        lon: { type: `Float!` },
      },
      interfaces: [`Node`],
    })
  )

  createTypes(
    schema.buildObjectType({
      name: `ContentfulNodeTypeJSON`,
      fields: {},
      interfaces: [`Node`],
    })
  )

  createTypes(
    schema.buildObjectType({
      name: `ContentfulNodeTypeText`,
      fields: {
        raw: `String!`,
      },
      interfaces: [`Node`],
    })
  )

  // Contentful content type schemas
  const ContentfulDataTypes = new Map([
    [`Symbol`, `String`],
    [
      `Text`,
      {
        type: `ContentfulNodeTypeText`,
        extensions: {
          link: { by: `id` },
        },
      },
    ],
    [`Integer`, `Int`],
    [`Number`, `Float`],
    [
      `Date`,
      {
        type: `Date`,
        extensions: {
          dateformat: {},
        },
      },
    ],
    [
      `Object`,
      {
        type: `ContentfulNodeTypeJSON`,
        extensions: {
          link: { by: `id` },
        },
      },
    ],
    [`Boolean`, `Boolean`],
    [
      `Location`,
      {
        type: `ContentfulNodeTypeLocation`,
        extensions: {
          link: { by: `id` },
        },
      },
    ],
    [
      `RichText`,
      {
        type: `ContentfulNodeTypeRichText`,
        extensions: {
          link: { by: `id` },
        },
      },
    ],
  ])
  const getLinkFieldType = linkType => `Contentful${linkType}`

  const translateFieldType = field => {
    let id
    if (field.type === `Array`) {
      const fieldData =
        field.items.type === `Link`
          ? getLinkFieldType(field.items.linkType)
          : translateFieldType(field.items)

      id =
        typeof fieldData === `string`
          ? `[${fieldData}]`
          : { ...fieldData, type: `[${fieldData.type}]` }
    } else if (field.type === `Link`) {
      id = getLinkFieldType(field.linkType)
    } else {
      id = ContentfulDataTypes.get(field.type)
    }

    if (typeof id === `string`) {
      return [id, field.required && `!`].filter(Boolean).join(``)
    }

    id = cloneDeep(id)

    if (field.required) {
      id.type = `${id.type}!`
    }

    if (id.extensions.link) {
      id.extensions.link.from = `${field.id}___NODE`
    }

    return id
  }

  contentTypeItems.forEach(contentTypeItem => {
    try {
      const fields = {}
      contentTypeItem.fields.forEach(field => {
        if (field.disabled || field.omitted) {
          return
        }
        const type = translateFieldType(field)
        fields[field.id] = typeof type === `string` ? { type } : type
      })

      const type = pluginConfig.get(`useNameForId`)
        ? contentTypeItem.name
        : contentTypeItem.sys.id

      createTypes(
        schema.buildObjectType({
          name: makeTypeName(type),
          fields: {
            contentful_id: { type: `String!` },
            id: { type: `ID!` },
            node_locale: { type: `String!` },
            spaceId: { type: `String!` },
            // @todo these should be real dates and in sys
            createdAt: { type: `String!` }, // { type: `Date`, extensions: { dateform: {} } },
            updatedAt: { type: `String!` }, // { type: `Date`, extensions: { dateform: {} } },
            ...fields,
          },
          interfaces: [`ContentfulReference`, `ContentfulEntry`, `Node`],
        })
      )
    } catch (err) {
      err.message = `Unable to create schema for Contentful Content Type ${
        contentTypeItem.name || contentTypeItem.sys.id
      }:\n${err.message}`
      throw err
    }
  })

  fs.writeFileSync(
    process.cwd() + `/generated-types.json`,
    JSON.stringify(types, null, 2)
  )
  createTypes = origTypes
}
