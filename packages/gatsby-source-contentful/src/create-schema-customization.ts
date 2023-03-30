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
import { getRichTextEntityLinks } from "@contentful/rich-text-links"
import { stripIndent } from "common-tags"
import { addRemoteFilePolyfillInterface } from "gatsby-plugin-utils/polyfill-remote-file"

import { fetchContentTypes } from "./fetch"
import { createPluginConfig } from "./plugin-options"
import { CODES } from "./report"
import { resolveGatsbyImageData } from "./gatsby-plugin-image"
import { makeTypeName } from "./normalize"
import { ImageCropFocusType, ImageResizingBehavior } from "./schemes"
import type { IPluginOptions } from "./types/plugin"
import type {
  ContentType,
  ContentTypeField,
  FieldItem,
} from "./types/contentful-js-sdk/content-type"

import type {
  IContentfulAsset,
  IContentfulEntry,
  IContentfulImageAPITransformerOptions,
} from "./types/contentful"

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
    (field): IContentfulGraphQLField => {
      return {
        type: `ContentfulText`,
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
  createTypes: CreateTypes
): IContentfulGraphQLField => {
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
  schema: NodePluginSchema,
  createTypes: CreateTypes
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
        ? getLinkFieldType(field.items.linkType, field, schema, createTypes)
        : translateFieldType(field.items, schema, createTypes)

    fieldType = { ...fieldData, type: `[${fieldData.type}]` }
  } else if (field.type === `Link`) {
    // Contentful Link (reference) field types
    fieldType = getLinkFieldType(
      field.linkType,
      field as ContentTypeField,
      schema,
      createTypes
    )
  } else {
    // Primitive field types
    const primitiveType = ContentfulDataTypes.get(field.type)
    if (!primitiveType) {
      throw new Error(`Contentful field type ${field.type} is not supported.`)
    }
    fieldType = primitiveType(field)
  }

  // TODO: what do we do when preview is enabled? Emptry required fields are valid for Contentfuls CP-API
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

    const useNameForId = pluginConfig.get(`useNameForId`)

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
              link: { by: `id`, from: `sys.contentType` },
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

    contentTypeItems.forEach(contentType => {
      let contentTypeItemId
      if (useNameForId) {
        contentTypeItemId = makeTypeName(contentType.name)
      } else {
        contentTypeItemId = makeTypeName(contentType.sys.id)
      }

      if (
        contentType.fields.some(
          field => field.linkType || field.items?.linkType
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

    const linkedFromName = `ContentfulLinkedFrom`
    createTypes(
      schema.buildObjectType({
        name: linkedFromName,
        fields: reverseLinkFields,
        extensions: { dontInfer: {} },
      })
    )

    // Assets
    const gatsbyImageData = getGatsbyImageFieldConfig(
      async (
        image: IContentfulAsset,
        options: IContentfulImageAPITransformerOptions
      ) => resolveGatsbyImageData(image, options, { cache }),
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
        // TODO: fix the type for extraArgs in gatsby-plugin-iomage so we dont have to cast to any here
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
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
            sys: {
              id: {
                in: links,
              },
              spaceId: { eq: node.sys.spaceId },
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

    // Text
    // TODO: Is there a way to have this as string and let transformer-remark replace it with an object?
    createTypes(
      schema.buildObjectType({
        name: `ContentfulText`,
        fields: {
          raw: `String!`,
        },
        // TODO: do we need a node interface here?
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

        const type = useNameForId
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
