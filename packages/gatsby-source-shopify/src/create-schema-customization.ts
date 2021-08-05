import {
  CreateSchemaCustomizationArgs,
  NodePluginSchema,
  GatsbyGraphQLObjectType,
} from "../../gatsby"

function addFields(
  def: GatsbyGraphQLObjectType,
  fields: GatsbyGraphQLObjectType["config"]["fields"]
): void {
  def.config.fields = {
    ...(def.config.fields || {}),
    ...fields,
  }
}

function defineImageNode(
  name: string,
  schema: NodePluginSchema,
  pluginOptions: ShopifyPluginOptions,
  fields: GatsbyGraphQLObjectType["config"]["fields"] = {}
): GatsbyGraphQLObjectType {
  const imageDef = schema.buildObjectType({
    name,
  })

  if (pluginOptions.downloadImages) {
    imageDef.config.fields = {
      localFile: {
        type: `File`,
        extensions: {
          link: {},
        },
      },
    }
  }

  addFields(imageDef, {
    ...fields,
    altText: `String`,
    height: `Int`,
    id: `String`,
    originalSrc: `String!`,
    transformedSrc: `String!`,
    width: `Int`,
  })

  return imageDef
}

export function createSchemaCustomization(
  { actions, schema }: CreateSchemaCustomizationArgs,
  pluginOptions: ShopifyPluginOptions
): void {
  const includeCollections = pluginOptions.shopifyConnections?.includes(
    `collections`
  )

  const includeOrders = pluginOptions.shopifyConnections?.includes(`orders`)

  const includeLocations = pluginOptions.shopifyConnections?.includes(
    `locations`
  )

  const name = (name: string): string =>
    `${pluginOptions.typePrefix || ``}${name}`

  const sharedMetafieldFields: GatsbyGraphQLObjectType["config"]["fields"] = {
    createdAt: `Date!`,
    description: `String`,
    id: `ID!`,
    key: `String!`,
    namespace: `String!`,
    ownerType: `String!`,
    updatedAt: `Date!`,
    value: `String!`,
    valueType: `String!`,
  }

  const metafieldInterface = schema.buildInterfaceType({
    name: name(`ShopifyMetafieldInterface`),
    fields: sharedMetafieldFields,
    // @ts-ignore TODO: Once Gatsby Core updates its graphql-compose package to a version that has the right
    // types to support interfaces implementing other interfaces, remove the ts-ignore
    interfaces: [`Node`],
  })

  const metafieldOwnerTypes = [`Product`, `ProductVariant`]
  if (includeCollections) {
    metafieldOwnerTypes.push(`Collection`)
  }

  const metafieldTypes = metafieldOwnerTypes.map((ownerType: string) => {
    const parentKey = ownerType.charAt(0).toLowerCase() + ownerType.slice(1)
    return schema.buildObjectType({
      name: name(`Shopify${ownerType}Metafield`),
      fields: {
        ...sharedMetafieldFields,
        [parentKey]: {
          type: name(`Shopify${ownerType}`),
          extensions: {
            link: {
              from: `${parentKey}Id`,
              by: `id`,
            },
          },
        },
      },
      interfaces: [`Node`, name(`ShopifyMetafieldInterface`)],
    })
  })

  const productDef = schema.buildObjectType({
    name: name(`ShopifyProduct`),
    fields: {
      tags: {
        type: `[String]`,
      },
      variants: {
        type: `[${name(`ShopifyProductVariant`)}]`,
        extensions: {
          link: {
            from: `id`,
            by: `productId`,
          },
        },
      },
      metafields: {
        type: `[${name(`ShopifyProductMetafield`)}]`,
        extensions: {
          link: {
            from: `id`,
            by: `productId`,
          },
        },
      },
      images: {
        type: `[${name(`ShopifyProductImage`)}]`,
        extensions: {
          link: {
            from: `id`,
            by: `productId`,
          },
        },
      },
    },
    interfaces: [`Node`],
  })

  const productImageDef = defineImageNode(
    name(`ShopifyProductImage`),
    schema,
    pluginOptions,
    {
      product: {
        type: name(`ShopifyProduct!`),
        extensions: {
          link: {
            from: `productId`,
            by: `id`,
          },
        },
      },
    }
  )

  productImageDef.config.interfaces = [`Node`]

  if (includeCollections) {
    addFields(productDef, {
      collections: {
        type: `[${name(`ShopifyCollection`)}]`,
        extensions: {
          link: {
            from: `id`,
            by: `productIds`,
          },
        },
      },
    })
  }

  const typeDefs = [
    productDef,
    productImageDef,
    schema.buildObjectType({
      name: name(`ShopifyProductVariant`),
      fields: {
        product: {
          type: name(`ShopifyProduct!`),
          extensions: {
            link: {
              from: `productId`,
              by: `id`,
            },
          },
        },
        metafields: {
          type: `[${name(`ShopifyProductVariantMetafield`)}]`,
          extensions: {
            link: {
              from: `id`,
              by: `productVariantId`,
            },
          },
        },
      },
      interfaces: [`Node`],
    }),
    metafieldInterface,
    ...metafieldTypes,
  ]

  if (includeCollections) {
    typeDefs.push(
      schema.buildObjectType({
        name: name(`ShopifyCollection`),
        fields: {
          products: {
            type: `[${name(`ShopifyProduct`)}]`,
            extensions: {
              link: {
                from: `productIds`,
                by: `id`,
              },
            },
          },
          metafields: {
            type: `[${name(`ShopifyCollectionMetafield`)}]`,
            extensions: {
              link: {
                from: `id`,
                by: `collectionId`,
              },
            },
          },
        },
        interfaces: [`Node`],
      })
    )
  }

  if (includeOrders) {
    typeDefs.push(
      schema.buildObjectType({
        name: name(`ShopifyOrder`),
        fields: {
          lineItems: {
            type: `[${name(`ShopifyLineItem`)}]`,
            extensions: {
              link: {
                from: `id`,
                by: `orderId`,
              },
            },
          },
        },
        interfaces: [`Node`],
      }),
      schema.buildObjectType({
        name: name(`ShopifyLineItem`),
        fields: {
          product: {
            type: name(`ShopifyProduct`),
            extensions: {
              link: {
                from: `productId`,
                by: `id`,
              },
            },
          },
          order: {
            type: name(`ShopifyOrder!`),
            extensions: {
              link: {
                from: `orderId`,
                by: `id`,
              },
            },
          },
        },
        interfaces: [`Node`],
      })
    )
  }

  if (includeLocations) {
    typeDefs.push(
      schema.buildObjectType({
        name: name(`ShopifyInventoryLevel`),
        fields: {
          location: {
            type: name(`ShopifyLocation`),
            extensions: {
              link: {
                from: `location.id`,
                by: `id`,
              },
            },
          },
        },
        interfaces: [`Node`],
      })
    )
  }

  typeDefs.push(
    ...[
      `ShopifyProductFeaturedImage`,
      `ShopifyProductFeaturedMediaPreviewImage`,
      `ShopifyProductVariantImage`,
    ].map(typeName => defineImageNode(name(typeName), schema, pluginOptions))
  )

  if (includeCollections) {
    typeDefs.push(
      defineImageNode(name(`ShopifyCollectionImage`), schema, pluginOptions)
    )
  }

  actions.createTypes(typeDefs)
}
