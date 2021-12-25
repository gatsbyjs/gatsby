import { CreateResolversArgs } from "gatsby"
import { getGatsbyImageFieldConfig } from "gatsby-plugin-image/graphql-utils"

import { shopifyTypes } from "./shopify-types"
import { makeResolveGatsbyImageData } from "./resolve-gatsby-image-data"

export function createResolvers(
  { createResolvers, cache }: CreateResolversArgs,
  { downloadImages, typePrefix = `` }: IShopifyPluginOptions
): void {
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
  for (const type of Object.keys(shopifyTypes)) {
    if (
      shopifyTypes?.[type]?.coupledNodeFields?.includes(`metafields___NODE`)
    ) {
      createResolvers({
        [`${typePrefix}Shopify${type}`]: {
          metafield: {
            resolve: async (source, args, context) =>
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
