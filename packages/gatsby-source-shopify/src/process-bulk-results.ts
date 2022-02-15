import { SourceNodesArgs } from "gatsby"

import { shopifyTypes } from "./shopify-types"
import {
  isShopifyId,
  createNodeId,
  parseShopifyId,
  decorateBulkObject,
  processShopifyImages,
} from "./helpers"

interface IBulkResultChildren {
  [key: string]: Array<string | IBulkResult>
}

export async function processBulkResults(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: IShopifyPluginOptions,
  results: BulkResults
): Promise<number> {
  let nodeCount = 0
  const promises: Array<Promise<void>> = []
  const children: IBulkResultChildren = {}

  for (let i = results.length - 1; i >= 0; i -= 1) {
    const result = decorateBulkObject(results[i])
    const resultIsNode =
      result.shopifyId &&
      JSON.stringify(Object.keys(result)) !== `["shopifyId","__parentId"]`

    if (resultIsNode) {
      const type = parseShopifyId(result.shopifyId)[1]
      const imageFields = shopifyTypes[type].imageFields
      const referenceFields = shopifyTypes[type].referenceFields

      // Only increment for parent nodes
      if (!result.__parentId) nodeCount++

      // Attach reference fields
      if (referenceFields) {
        for (const referenceField of referenceFields) {
          result[referenceField] = []
        }
      }

      // Attach children references / objects
      if (children[result.shopifyId]) {
        for (const child of children[result.shopifyId]) {
          const childType =
            typeof child === `string`
              ? parseShopifyId(child)[1]
              : child.__typename
          const field = shopifyTypes[childType].key

          if (field) {
            result[field] = [
              typeof child === `string`
                ? createNodeId(child, gatsbyApi, pluginOptions)
                : child,
              ...(result[field] || []),
            ]
          } else {
            throw new Error(
              `There is no shopifyType for child type: ${childType}`
            )
          }
        }
      }

      if (!isShopifyId(result.shopifyId)) {
        throw new Error(
          `Expected an ID in the format gid://shopify/<typename>/<id>`
        )
      }

      const node = {
        ...result,
        id: createNodeId(result.shopifyId, gatsbyApi, pluginOptions),
        internal: {
          type: `${pluginOptions.typePrefix || ``}Shopify${type}`,
          contentDigest: gatsbyApi.createContentDigest(result),
        },
      } as IShopifyNode

      if (pluginOptions.downloadImages && imageFields) {
        promises.push(
          processShopifyImages(gatsbyApi, node).then(() =>
            gatsbyApi.actions.createNode(node)
          )
        )
      } else {
        gatsbyApi.actions.createNode(node)
      }
    }

    // If the object is a child store the reference
    if (result.__parentId) {
      children[result.__parentId] = [
        ...(children[result.__parentId] || []),
        result.shopifyId || result,
      ]
    }
  }

  await Promise.all(promises)
  return nodeCount
}
