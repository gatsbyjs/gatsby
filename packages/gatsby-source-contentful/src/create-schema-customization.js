// @ts-check
import _ from "lodash"
import { fetchContentTypes } from "./fetch"
import { createPluginConfig } from "./plugin-options"
import { CODES } from "./report"

import { getRichTextEntityLinks } from "@contentful/rich-text-links"
import { stripIndent } from "common-tags"
import { addRemoteFilePolyfillInterface } from "gatsby-plugin-utils/polyfill-remote-file"

import { resolveGatsbyImageData } from "./gatsby-plugin-image"
import { makeTypeName } from "./normalize"
import { ImageCropFocusType, ImageResizingBehavior } from "./schemes"

// Contentful content type schemas
/** @type {Map<string, (val: unknown) => { type: string; }>} */
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
        type: `ContentfulText`,
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
      return { type: `ContentfulLocation` }
    },
  ],
  [
    `RichText`,
    () => {
      return { type: `ContentfulRichText` }
    },
  ],
])

const unionsNameSet = new Set()

const getLinkFieldType = (linkType, field, schema, createTypes) => {
  // Check for validations
  const validations =
    field.type === `Array` ? field.items?.validations : field?.validations

  if (validations) {
    // We only handle content type validations
    const linkContentTypeValidation = validations.find(
      ({ linkContentType }) => !!linkContentType
    )
    if (linkContentTypeValidation) {
      const { linkContentType } = linkContentTypeValidation
      const contentTypes = Array.isArray(linkContentType)
        ? linkContentType
        : [linkContentType]

      // Full type names for union members, shorter variant for the union type name
      const translatedTypeNames = contentTypes.map(typeName =>
        makeTypeName(typeName)
      )
      const shortTypeNames = contentTypes.map(typeName =>
        makeTypeName(typeName, ``)
      )

      // Single content type
      if (translatedTypeNames.length === 1) {
        return {
          type: translatedTypeNames.shift(),
          extensions: {
            link: { by: `id`, from: `${field.id}___NODE` },
          },
        }
      }

      // Multiple content types
      const unionName = [`UnionContentful`, ...shortTypeNames].join(``)

      if (!unionsNameSet.has(unionName)) {
        unionsNameSet.add(unionName)
        createTypes(
          schema.buildUnionType({
            name: unionName,
            types: translatedTypeNames,
          })
        )
      }

      return {
        type: unionName,
        extensions: {
          link: { by: `id`, from: `${field.id}___NODE` },
        },
      }
    }
  }

  return {
    type: `Contentful${linkType}`,
    extensions: {
      link: { by: `id`, from: `${field.id}___NODE` },
    },
  }
}

// Translate Contentful field types to GraphQL field types
const translateFieldType = (field, schema, createTypes) => {
  let fieldType
  if (field.type === `Array`) {
    // Arrays of Contentful Links or primitive types
    const fieldData =
      field.items.type === `Link`
        ? getLinkFieldType(field.items.linkType, field, schema, createTypes)
        : translateFieldType(field.items, schema, createTypes)

    fieldType = { ...fieldData, type: `[${fieldData.type}]` }
  } else if (field.type === `Link`) {
    // Contentful Link (reference) field types
    fieldType = getLinkFieldType(field.linkType, field, schema, createTypes)
  } else {
    // Primitive field types
    fieldType = ContentfulDataTypes.get(field.type)(field)
  }

  // @todo what do we do when preview is enabled? Emptry required fields are valid for Contentfuls CP-API
  // if (field.required) {
  //   fieldType.type = `${fieldType.type}!`
  // }

  return fieldType
}

async function getContentTypesFromContentful({
  cache,
  reporter,
  pluginConfig,
}) {
  // Get content type items from Contentful
  const allContentTypeItems = await fetchContentTypes({
    pluginConfig,
    reporter,
  })

  const contentTypeFilter = pluginConfig.get(`contentTypeFilter`)

  const contentTypeItems = allContentTypeItems.filter(contentTypeFilter)

  if (contentTypeItems.length === 0) {
    reporter.panic({
      id: CODES.ContentTypesMissing,
      context: {
        sourceMessage: `Please check if your contentTypeFilter is configured properly. Content types were filtered down to none.`,
      },
    })
  }

  // Store processed content types in cache for sourceNodes
  const sourceId = `${pluginConfig.get(`spaceId`)}-${pluginConfig.get(
    `environment`
  )}`
  const CACHE_CONTENT_TYPES = `contentful-content-types-${sourceId}`
  await cache.set(CACHE_CONTENT_TYPES, contentTypeItems)

  return contentTypeItems
}

export async function createSchemaCustomization(
  { schema, actions, reporter, cache },
  pluginOptions
) {
  const { createTypes } = actions

  const pluginConfig = createPluginConfig(pluginOptions)

  let contentTypeItems
  if (process.env.GATSBY_WORKER_ID) {
    const sourceId = `${pluginConfig.get(`spaceId`)}-${pluginConfig.get(
      `environment`
    )}`
    contentTypeItems = await cache.get(`contentful-content-types-${sourceId}`)
  } else {
    contentTypeItems = await getContentTypesFromContentful({
      cache,
      reporter,
      pluginConfig,
    })
  }

  // Generic Types
  createTypes(
    schema.buildInterfaceType({
      name: `ContentfulEntity`,
      fields: {
        id: { type: `ID!` },
        sys: { type: `ContentfulSys!` },
        metadata: { type: `ContentfulMetadata!` },
      },
      interfaces: [`Node`],
    })
  )

  createTypes(
    schema.buildInterfaceType({
      name: `ContentfulEntry`,
      fields: {
        id: { type: `ID!` },
        sys: { type: `ContentfulSys!` },
        metadata: { type: `ContentfulMetadata!` },
      },
      interfaces: [`ContentfulEntity`, `Node`],
    })
  )

  createTypes(
    schema.buildObjectType({
      name: `ContentfulContentType`,
      fields: {
        id: { type: `ID!` },
        name: { type: `String!` },
        displayField: { type: `String!` },
        description: { type: `String!` },
      },
      interfaces: [`Node`],
      extensions: { dontInfer: {} },
    })
  )

  createTypes(
    schema.buildObjectType({
      name: `ContentfulSys`,
      fields: {
        id: { type: ` String!` },
        type: { type: ` String!` },
        spaceId: { type: ` String!` },
        environmentId: { type: ` String!` },
        contentType: {
          type: `ContentfulContentType`,
          extensions: {
            link: { by: `id`, from: `contentType___NODE` },
          },
        },
        firstPublishedAt: { type: ` Date!` },
        publishedAt: { type: ` Date!` },
        publishedVersion: { type: ` Int!` },
        locale: { type: ` String!` },
      },
      interfaces: [`Node`],
      extensions: { dontInfer: {} },
    })
  )

  createTypes(
    schema.buildObjectType({
      name: `ContentfulMetadata`,
      fields: {
        tags: {
          type: `[ContentfulTag]!`,
          extensions: {
            link: { by: `id`, from: `tags___NODE` },
          },
        },
      },
      extensions: { dontInfer: {} },
    })
  )

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

  const { getGatsbyImageFieldConfig } = await import(
    `gatsby-plugin-image/graphql-utils`
  )

  // Assets
  const gatsbyImageData = getGatsbyImageFieldConfig(
    async (...args) => resolveGatsbyImageData(...args, { cache }),
    {
      jpegProgressive: {
        type: `Boolean`,
        defaultValue: true,
      },
      resizingBehavior: {
        type: ImageResizingBehavior,
      },
      cropFocus: {
        type: ImageCropFocusType,
      },
      cornerRadius: {
        type: `Int`,
        defaultValue: 0,
        description: stripIndent`
                 Desired corner radius in pixels. Results in an image with rounded corners.
                 Pass \`-1\` for a full circle/ellipse.`,
      },
      quality: {
        type: `Int`,
        defaultValue: 50,
      },
    }
  )
  gatsbyImageData.type = `JSON`
  createTypes(
    addRemoteFilePolyfillInterface(
      schema.buildObjectType({
        name: `ContentfulAsset`,
        fields: {
          id: { type: `ID!` },
          sys: { type: `ContentfulSys!` },
          metadata: { type: `ContentfulMetadata!` },
          gatsbyImageData,
          ...(pluginConfig.get(`downloadLocal`)
            ? {
                localFile: {
                  type: `File`,
                  extensions: {
                    link: {
                      from: `fields.localFile`,
                    },
                  },
                },
              }
            : {}),
          title: { type: `String` },
          description: { type: `String` },
          contentType: { type: `String!` },
          mimeType: { type: `String!` },
          filename: { type: `String!` },
          url: { type: `String!` },
          size: { type: `Int` },
          width: { type: `Int` },
          height: { type: `Int` },
        },
        interfaces: [`ContentfulEntity`, `Node`],
        extensions: { dontInfer: {} },
      }),
      {
        schema,
        actions,
      }
    )
  )

  // Rich Text
  const makeRichTextLinksResolver =
    (nodeType, entityType) => (source, args, context) => {
      const links = getRichTextEntityLinks(source, nodeType)[entityType].map(
        ({ id }) => id
      )

      return context.nodeModel.getAllNodes().filter(
        node =>
          node.internal.owner === `gatsby-source-contentful` &&
          node?.sys?.id &&
          node?.sys?.type === entityType &&
          links.includes(node.sys.id)
        // @todo how can we check for correct space and environment? We need to access the sys field of the fields parent entry.
      )
    }

  // Contentful specific types
  createTypes(
    schema.buildObjectType({
      name: `ContentfulRichTextAssets`,
      fields: {
        block: {
          type: `[ContentfulAsset]!`,
          resolve: makeRichTextLinksResolver(`embedded-asset-block`, `Asset`),
        },
        hyperlink: {
          type: `[ContentfulAsset]!`,
          resolve: makeRichTextLinksResolver(`asset-hyperlink`, `Asset`),
        },
      },
    })
  )

  createTypes(
    schema.buildObjectType({
      name: `ContentfulRichTextEntries`,
      fields: {
        inline: {
          type: `[ContentfulEntry]!`,
          resolve: makeRichTextLinksResolver(`embedded-entry-inline`, `Entry`),
        },
        block: {
          type: `[ContentfulEntry]!`,
          resolve: makeRichTextLinksResolver(`embedded-entry-block`, `Entry`),
        },
        hyperlink: {
          type: `[ContentfulEntry]!`,
          resolve: makeRichTextLinksResolver(`entry-hyperlink`, `Entry`),
        },
      },
    })
  )

  createTypes(
    schema.buildObjectType({
      name: `ContentfulRichTextLinks`,
      fields: {
        assets: {
          type: `ContentfulRichTextAssets`,
          resolve(source) {
            return source
          },
        },
        entries: {
          type: `ContentfulRichTextEntries`,
          resolve(source) {
            return source
          },
        },
      },
    })
  )

  createTypes(
    schema.buildObjectType({
      name: `ContentfulRichText`,
      fields: {
        json: {
          type: `JSON`,
          resolve(source) {
            return source
          },
        },
        links: {
          type: `ContentfulRichTextLinks`,
          resolve(source) {
            return source
          },
        },
      },
      extensions: { dontInfer: {} },
    })
  )

  // Location
  createTypes(
    schema.buildObjectType({
      name: `ContentfulLocation`,
      fields: {
        lat: { type: `Float!` },
        lon: { type: `Float!` },
      },
      extensions: {
        dontInfer: {},
      },
    })
  )

  // Text
  // @todo Is there a way to have this as string and let transformer-remark replace it with an object?
  createTypes(
    schema.buildObjectType({
      name: `ContentfulText`,
      fields: {
        raw: `String!`,
      },
      // @todo do we need a node interface here?
      interfaces: [`Node`],
      extensions: {
        dontInfer: {},
      },
    })
  )

  // Content types
  for (const contentTypeItem of contentTypeItems) {
    try {
      const fields = {}
      contentTypeItem.fields.forEach(field => {
        if (field.disabled || field.omitted) {
          return
        }
        if ([`id`, `sys`, `contentfulMetadata`].includes(field.id)) {
          // Throw error on reserved field names as the Contenful GraphQL API does:
          // https://www.contentful.com/developers/docs/references/graphql/#/reference/schema-generation/fields
          throw new Error(
            `Unfortunately the field name ${field.id} is reserved. ${contentTypeItem.name}@${contentTypeItem.sys.id}`
          )
        }
        fields[field.id] = translateFieldType(field, schema, createTypes)
      })

      const type = pluginConfig.get(`useNameForId`)
        ? contentTypeItem.name
        : contentTypeItem.sys.id

      createTypes(
        schema.buildObjectType({
          name: makeTypeName(type),
          fields: {
            id: { type: `ID!` },
            sys: { type: `ContentfulSys!` },
            metadata: { type: `ContentfulMetadata!` },
            ...fields,
          },
          interfaces: [`ContentfulEntity`, `ContentfulEntry`, `Node`],
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
