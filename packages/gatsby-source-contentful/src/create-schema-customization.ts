import type {
  GatsbyNode,
  NodePluginSchema,
  CreateSchemaCustomizationArgs,
} from "gatsby"
import {
  GraphQLFieldConfig,
  GraphQLFloat,
  GraphQLInt,
  GraphQLString,
  GraphQLType,
} from "gatsby/graphql"
import type { ObjectTypeComposerArgumentConfigMapDefinition } from "graphql-compose"
import { getRichTextEntityLinks } from "@contentful/rich-text-links"
import { stripIndent } from "common-tags"
import { addRemoteFilePolyfillInterface } from "gatsby-plugin-utils/polyfill-remote-file"

import { fetchContentTypes } from "./fetch"
import { createPluginConfig } from "./plugin-options"
import { CODES } from "./report"
import { resolveGatsbyImageData } from "./gatsby-plugin-image"
import { makeTypeName } from "./normalize"
import { ImageCropFocusType, ImageResizingBehavior } from "./schemes"
import type { IPluginOptions, MarkdownFieldDefinition } from "./types/plugin"
import type { ContentType, ContentTypeField, FieldItem } from "contentful"

import type {
  IContentfulAsset,
  IContentfulEntry,
  IContentfulImageAPITransformerOptions,
} from "./types/contentful"
import { detectMarkdownField, makeContentTypeIdMap } from "./utils"
import { restrictedNodeFields } from "./config"

type CreateTypes = CreateSchemaCustomizationArgs["actions"]["createTypes"]

interface IContentfulGraphQLField
  extends Omit<Partial<GraphQLFieldConfig<unknown, unknown>>, "type"> {
  type: string | GraphQLType
  id?: string
}

// Contentful content type schemas
const ContentfulDataTypes: Map<
  string,
  (field: IContentfulGraphQLField) => IContentfulGraphQLField
> = new Map([
  [
    `Symbol`,
    (): IContentfulGraphQLField => {
      return { type: GraphQLString }
    },
  ],
  [
    `Text`,
    (): IContentfulGraphQLField => {
      return { type: GraphQLString }
    },
  ],
  [
    `Markdown`,
    (field): IContentfulGraphQLField => {
      return {
        type: `ContentfulMarkdown`,
        extensions: {
          link: { by: `id`, from: field.id },
        },
      }
    },
  ],
  [
    `Integer`,
    (): IContentfulGraphQLField => {
      return { type: GraphQLInt }
    },
  ],
  [
    `Number`,
    (): IContentfulGraphQLField => {
      return { type: GraphQLFloat }
    },
  ],
  [
    `Date`,
    (): IContentfulGraphQLField => {
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
    (): IContentfulGraphQLField => {
      return { type: `JSON` }
    },
  ],
  [
    `Boolean`,
    (): IContentfulGraphQLField => {
      return { type: `Boolean` }
    },
  ],
  [
    `Location`,
    (): IContentfulGraphQLField => {
      return { type: `ContentfulLocation` }
    },
  ],
  [
    `RichText`,
    (): IContentfulGraphQLField => {
      return { type: `ContentfulRichText` }
    },
  ],
])

const unionsNameSet = new Set()
const getLinkFieldType = (
  linkType: string | undefined,
  field: ContentTypeField,
  schema: NodePluginSchema,
  createTypes: CreateTypes,
  contentTypeIdMap: Map<string, string>
): IContentfulGraphQLField => {
  // Check for validations
  const validations =
    field.type === `Array` ? field.items?.validations : field?.validations

  if (validations) {
    // We only handle content type validations
    const linkContentTypeValidation = validations.find(
      ({ linkContentType }) => !!linkContentType
    )
    if (
      linkContentTypeValidation &&
      linkContentTypeValidation.linkContentType
    ) {
      const { linkContentType } = linkContentTypeValidation
      const contentTypes = Array.isArray(linkContentType)
        ? linkContentType
        : [linkContentType]

      // We need to remove non existant content types from outdated validations to avoid broken unions
      const filteredTypes = contentTypes.filter(typeId =>
        contentTypeIdMap.has(typeId)
      )

      // Full type names for union members, shorter variant for the union type name
      const translatedTypeNames = filteredTypes.map(
        typeId => contentTypeIdMap.get(typeId) as string
      )
      const shortTypeNames = filteredTypes
        .map(typeName => makeTypeName(typeName, ``))
        .sort()

      // Single content type
      if (translatedTypeNames.length === 1) {
        const typeName = translatedTypeNames.shift()
        if (!typeName || !field.id) {
          throw new Error(
            `Translated type name can not be empty. A field id is required as well. ${JSON.stringify(
              { typeName, field, translatedTypeNames, shortTypeNames },
              null,
              2
            )}`
          )
        }
        return {
          type: typeName,
          extensions: {
            link: { by: `id`, from: field.id },
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
          link: { by: `id`, from: field.id },
        },
      }
    }
  }

  return {
    type: `Contentful${linkType}`,
    extensions: {
      link: { by: `id`, from: field.id },
    },
  }
}
// Translate Contentful field types to GraphQL field types
const translateFieldType = (
  field: ContentTypeField | FieldItem,
  contentTypeItem: ContentType,
  schema: NodePluginSchema,
  createTypes: CreateTypes,
  enableMarkdownDetection: boolean,
  markdownFields: MarkdownFieldDefinition,
  contentTypeIdMap: Map<string, string>
): GraphQLFieldConfig<unknown, unknown> => {
  let fieldType
  if (field.type === `Array`) {
    if (!field.items) {
      throw new Error(
        `Invalid content type field definition:\n${JSON.stringify(
          field,
          null,
          2
        )}`
      )
    }
    // Arrays of Contentful Links or primitive types
    const fieldData =
      field.items?.type === `Link`
        ? getLinkFieldType(
            field.items.linkType,
            field,
            schema,
            createTypes,
            contentTypeIdMap
          )
        : translateFieldType(
            field.items,
            contentTypeItem,
            schema,
            createTypes,
            enableMarkdownDetection,
            markdownFields,
            contentTypeIdMap
          )

    fieldType = { ...fieldData, type: `[${fieldData.type}]` }
  } else if (field.type === `Link`) {
    // Contentful Link (reference) field types
    fieldType = getLinkFieldType(
      field.linkType,
      field as ContentTypeField,
      schema,
      createTypes,
      contentTypeIdMap
    )
  } else {
    // Detect markdown in text fields
    const typeName = detectMarkdownField(
      field as ContentTypeField,
      contentTypeItem,
      enableMarkdownDetection,
      markdownFields
    )

    // Primitive field types
    const primitiveType = ContentfulDataTypes.get(typeName)
    if (!primitiveType) {
      throw new Error(`Contentful field type ${field.type} is not supported.`)
    }
    fieldType = primitiveType(field)
  }

  // To support Contentful's CPA (Content Preview API), we have to allow empty required fields.
  // if (field.required) {
  //   fieldType.type = `${fieldType.type}!`
  // }

  return fieldType
}

async function getContentTypesFromContentful({
  cache,
  reporter,
  pluginConfig,
}): Promise<Array<ContentType>> {
  // Get content type items from Contentful
  const allContentTypeItems = await fetchContentTypes({
    pluginConfig,
    reporter,
  })

  if (!allContentTypeItems) {
    throw new Error(
      `Could not locate any content types in Contentful space ${pluginConfig.get(
        `spaceId`
      )}.`
    )
  }
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

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] =
  async function ({ schema, actions, store, reporter, cache }, pluginOptions) {
    const { createTypes } = actions

    const pluginConfig = createPluginConfig(pluginOptions as IPluginOptions)

    const contentTypePrefix = pluginConfig.get(`contentTypePrefix`)
    const useNameForId = pluginConfig.get(`useNameForId`)
    const enableMarkdownDetection: boolean = pluginConfig.get(
      `enableMarkdownDetection`
    )
    const markdownFields: MarkdownFieldDefinition = new Map(
      pluginConfig.get(`markdownFields`)
    )

    let contentTypeItems: Array<ContentType>
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
          contentfulMetadata: { type: `ContentfulMetadata!` },
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
          contentfulMetadata: { type: `ContentfulMetadata!` },
          linkedFrom: { type: `ContentfulLinkedFrom` },
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
              link: { by: `id`, from: `contentType` },
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

    createTypes(
      schema.buildObjectType({
        name: `ContentfulMetadata`,
        fields: {
          tags: {
            type: `[ContentfulTag]!`,
            extensions: {
              link: { by: `id`, from: `tags` },
            },
          },
        },
        extensions: { dontInfer: {} },
      })
    )

    const { getGatsbyImageFieldConfig } = await import(
      `gatsby-plugin-image/graphql-utils.js`
    )

    const reverseLinkFields = {}
    const contentTypeIdMap = makeContentTypeIdMap(
      contentTypeItems,
      contentTypePrefix,
      useNameForId
    )

    contentTypeItems.forEach(contentType => {
      const contentTypeItemId = contentTypeIdMap.get(contentType.sys.id)

      if (!contentTypeItemId) {
        throw new Error(
          `Could not locate id for content type ${contentType.sys.id} (${contentType.name})`
        )
      }

      if (
        contentType.fields.some(
          field =>
            field.linkType || field.items?.linkType || field.type === `RichText`
        )
      ) {
        reverseLinkFields[contentTypeItemId] = {
          type: `[${contentTypeItemId}]`,
          extensions: {
            link: { by: `id`, from: contentTypeItemId },
          },
        }
      }
    })

    // When nothing is set up to be linked in the Contentful Content Model, schema building fails
    // as empty fields get removed by graphql-compose
    if (Object.keys(reverseLinkFields).length === 0) {
      contentTypeItems.forEach(contentType => {
        const contentTypeItemId = contentTypeIdMap.get(contentType.sys.id)

        if (contentTypeItemId) {
          reverseLinkFields[contentTypeItemId] = {
            type: `[${contentTypeItemId}]`,
            extensions: {
              link: { by: `id`, from: contentTypeItemId },
            },
          }
        }
      })
    }

    const linkedFromName = `ContentfulLinkedFrom`
    createTypes(
      schema.buildObjectType({
        name: linkedFromName,
        fields: reverseLinkFields,
        extensions: { dontInfer: {} },
      })
    )

    // Assets
    const gatsbyImageData = getGatsbyImageFieldConfig<
      IContentfulAsset,
      null,
      IContentfulImageAPITransformerOptions
    >(
      async (image, options) =>
        resolveGatsbyImageData(image, options, { cache }),
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
      } as unknown as ObjectTypeComposerArgumentConfigMapDefinition<IContentfulImageAPITransformerOptions>
    )
    gatsbyImageData.type = `JSON`
    createTypes(
      addRemoteFilePolyfillInterface(
        schema.buildObjectType({
          name: `ContentfulAsset`,
          fields: {
            id: { type: `ID!` },
            sys: { type: `ContentfulSys!` },
            contentfulMetadata: { type: `ContentfulMetadata!` },
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
            linkedFrom: { type: linkedFromName },
          },
          interfaces: [`ContentfulEntity`, `Node`],
          extensions: { dontInfer: {} },
        }),
        {
          schema,
          actions,
          store,
        }
      )
    )

    // Rich Text
    const makeRichTextLinksResolver =
      (nodeType, entityType) =>
      async (
        source,
        _args,
        context
      ): Promise<Array<IContentfulEntry> | null> => {
        const links = getRichTextEntityLinks(source, nodeType)[entityType].map(
          ({ id }) => id
        )

        const node = context.nodeModel.findRootNodeAncestor(source)
        if (!node) return null

        const res = await context.nodeModel.findAll({
          query: {
            filter: {
              sys: {
                id: {
                  in: links,
                },
                spaceId: { eq: node.sys.spaceId },
              },
            },
          },
          type: `Contentful${entityType}`,
        })

        return res.entries
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
            resolve: makeRichTextLinksResolver(
              `embedded-entry-inline`,
              `Entry`
            ),
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

    // Text (Markdown, as text is a pure string)
    createTypes(
      schema.buildObjectType({
        name: `ContentfulMarkdown`,
        fields: {
          raw: `String!`,
        },
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
          if (field.omitted) {
            return
          }
          if (restrictedNodeFields.includes(field.id)) {
            // Throw error on reserved field names as the Contenful GraphQL API does:
            // https://www.contentful.com/developers/docs/references/graphql/#/reference/schema-generation/fields
            throw new Error(
              `Unfortunately the field name ${field.id} is reserved. ${contentTypeItem.name}@${contentTypeItem.sys.id}`
            )
          }
          fields[field.id] = translateFieldType(
            field,
            contentTypeItem,
            schema,
            createTypes,
            enableMarkdownDetection,
            markdownFields,
            contentTypeIdMap
          )
        })

        const type = contentTypeIdMap.get(contentTypeItem.sys.id) as string

        createTypes(
          schema.buildObjectType({
            name: type,
            fields: {
              id: { type: `ID!` },
              sys: { type: `ContentfulSys!` },
              contentfulMetadata: { type: `ContentfulMetadata!` },
              ...fields,
              linkedFrom: linkedFromName,
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
