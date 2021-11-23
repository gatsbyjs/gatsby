import { CreateResolversArgs } from "gatsby"
import { getGatsbyImageFieldConfig } from "gatsby-plugin-image/graphql-utils"

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
}
