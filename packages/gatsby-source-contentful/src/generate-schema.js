const fs = require(`fs`)

import { makeTypeName } from "./normalize"

const types = []

function generateAssetSchemas({ createTypes }) {
  createTypes(`
    type ContentfulAsset implements ContentfulReference & Node @derivedTypes @dontInfer {
      file: ContentfulAssetFile
      title: String
      description: String
      node_locale: String
      sys: ContentfulAssetSys
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
      spaceId: String!,
      createdAt: Date @dateform,
      updatedAt: Date @dateform,
    }
  `)

  generateAssetSchemas({ createTypes })

  // Contentful specific types

  createTypes(
    schema.buildObjectType({
      name: `ContentfulRichTextNode`,
      fields: {
        raw: { type: `String!` },
        references: { type: `ContentfulReference` },
      },
      interfaces: [`Node`],
    })
  )

  createTypes(
    schema.buildObjectType({
      name: `ContentfulLocationNode`,
      fields: {
        lat: { type: `Float!` },
        lon: { type: `Float!` },
      },
      interfaces: [`Node`],
    })
  )

  createTypes(
    schema.buildObjectType({
      name: `ContentfulJSONNode`,
      fields: {},
      interfaces: [`Node`],
    })
  )

  createTypes(
    schema.buildObjectType({
      name: `ContentfulTextNode`,
      fields: {},
      interfaces: [`Node`],
    })
  )

  // Contentful content type schemas
  const ContentfulDataTypes = new Map([
    [`Symbol`, `String`],
    [`Text`, `String`],
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
    [`Object`, `JSON`],
    [`Boolean`, `Boolean`],
    [`Location`, `ContentfulLocationNode`],
    [`RichText`, `ContentfulRichTextNode`],
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

    if (field.required) {
      id.type = `${id.type}!`
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

      // console.log(contentTypeItem.sys.id, { fields })

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
