import { SourceNodesArgs } from "gatsby"
import { createRemoteFileNode } from "gatsby-source-filesystem"

import { shopifyTypes } from "./shopify-types"
import { createNodeId, isShopifyId, parseShopifyId } from "./helpers"

interface IBulkResultChildren {
  [key: string]: Array<string | BulkResult>
}

export async function processShopifyImages(
  {
    actions: { createNode },
    createNodeId,
    cache,
    store,
    reporter,
  }: SourceNodesArgs,
  node: IShopifyNode
): Promise<void> {
  const type = parseShopifyId(node.shopifyId)[1]
  const imageFields = shopifyTypes[type].imageFields

  if (imageFields) {
    for (const fieldPath of imageFields) {
      const image = fieldPath
        .split(`.`)
        .reduce((acc, value) => acc[value], node)

      if (image) {
        const fileNode = await createRemoteFileNode({
          url: image.originalSrc,
          cache,
          createNode,
          createNodeId,
          parentNodeId: node.id,
          store,
          reporter,
        })

        image.localFile___NODE = fileNode.id
      }
    }
  }
}

export async function processBulkResults(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: IShopifyPluginOptions,
  results: BulkResults
): Promise<void> {
  const promises: Array<Promise<void>> = []
  const children: IBulkResultChildren = {}

  for (let i = results.length - 1; i >= 0; i -= 1) {
    const result = { ...results[i] }
    const resultIsNode =
      result.id && JSON.stringify(Object.keys(result)) !== `["id","__parentId"]`

    if (resultIsNode) {
      const type = parseShopifyId(result.id)[1]
      const imageFields = shopifyTypes[type].imageFields
      const referenceFields = shopifyTypes[type].referenceFields

      // Attach reference fields
      if (referenceFields) {
        for (const referenceField of referenceFields) {
          result[referenceField] = []
        }
      }

      // Attach children references / objects
      if (children[result.id]) {
        for (const child of children[result.id]) {
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

      if (!isShopifyId(result.id)) {
        throw new Error(
          `Expected an ID in the format gid://shopify/<typename>/<id>`
        )
      }

      const node = {
        ...result,
        id: createNodeId(result.id, gatsbyApi, pluginOptions),
        shopifyId: result.id,
        internal: {
          type: `${pluginOptions.typePrefix || ``}Shopify${type}`,
          contentDigest: gatsbyApi.createContentDigest(result),
        },
      }

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
        result.id || result,
      ]
    }
  }

  await Promise.all(promises)
}
