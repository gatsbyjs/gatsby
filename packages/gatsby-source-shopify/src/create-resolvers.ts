import { CreateResolversArgs } from "gatsby"
import { getGatsbyImageFieldConfig } from "gatsby-plugin-image/graphql-utils"

import { shopifyTypes } from "./shopify-types"
import { makeResolveGatsbyImageData } from "./resolve-gatsby-image-data"

export function createResolvers(
  gatsbyApi: CreateResolversArgs,
  pluginOptions: IShopifyPluginOptions
): void {
  const { createResolvers, cache } = gatsbyApi
  const {
    downloadImages,
    typePrefix,
    shopifyConnections: connections,
  } = pluginOptions

  if (!downloadImages) {
    createResolvers({
      [`${typePrefix}ShopifyImage`]: {
        gatsbyImageData: {
          ...getGatsbyImageFieldConfig(makeResolveGatsbyImageData(cache)),
          type: `JSON`, // Because gatsbyImageData will be undefined for GIFs it must be optional
        },
      },
    })
  }

  // Attach the metafield resolver to all types with a metafields field
  for (const [type, value] of Object.entries(shopifyTypes)) {
    if (value.coupledNodeFields?.includes(`metafields___NODE`)) {
      // Only include the resolver if the type is included in the build
      if (!value.optionalKey || connections.includes(value.optionalKey)) {
        createResolvers({
          [`${typePrefix}Shopify${type}`]: {
            metafield: {
              resolve: async (
                source: IShopifyNode,
                args: { key: string; namespace: string },
                context: {
                  nodeModel: {
                    findOne: (object: unknown) => IShopifyNode | undefined
                  }
                }
              ) =>
                context.nodeModel.findOne({
                  type: `${typePrefix}ShopifyMetafield`,
                  query: {
                    filter: {
                      key: { eq: args.key },
                      namespace: { eq: args.namespace },
                      id: { in: source.metafields___NODE },
                    },
                  },
                }),
            },
          },
        })
      }
    }
  }
}
