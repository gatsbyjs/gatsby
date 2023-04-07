import { SourceNodesArgs } from "gatsby"

import { shopifyTypes } from "./shopify-types"
import {
  isShopifyId,
  createNodeId,
  parseShopifyId,
  decorateBulkObject,
  processShopifyImages,
} from "./helpers"

interface IDecoratedResultChildren {
  [key: string]: Array<string | IDecoratedResult>
}

function isNode(result: IDecoratedResult): boolean {
  const keys = Object.keys(result)
  return Boolean(
    result.shopifyId &&
      !(keys.length === 2 && result.__parentId && result.shopifyId)
  )
}

export async function processBulkResults(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: IShopifyPluginOptions,
  results: BulkResults
): Promise<number> {
  let nodeCount = 0
  const promises: Array<Promise<void>> = []
  const children: IDecoratedResultChildren = {}

  const gatsbyCreateNodeId = (shopifyId: string): string =>
    createNodeId(shopifyId, gatsbyApi, pluginOptions)

  for (let i = results.length - 1; i >= 0; i -= 1) {
    const result = decorateBulkObject(
      results[i],
      gatsbyCreateNodeId
    ) as IDecoratedResult
    /**
     * @todo detect the following different as JSON.stringify order is not deterministic
     */
    const resultIsNode = isNode(result)

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
              : (child.__typename as string)
          const field = shopifyTypes[childType].key

          if (field) {
            result[field] = [
              typeof child === `string`
                ? createNodeId(child, gatsbyApi, pluginOptions)
                : child,
              ...((result[field] || []) as Array<unknown>),
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
          type: `${pluginOptions.typePrefix}Shopify${type}`,
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
