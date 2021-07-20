import { NodeInput, SourceNodesArgs } from "gatsby"
import { createNodeId, pattern as idPattern } from "../node-builder"

export function productVariantsProcessor(
  objects: BulkResults,
  builder: NodeBuilder,
  gatsbyApi: SourceNodesArgs,
  pluginOptions: ShopifyPluginOptions
): Array<Promise<NodeInput>> {
  const filteredObjects = objects.filter(obj => {
    const [, remoteType] = obj.id.match(idPattern) || []

    return remoteType !== `Product`
  })

  const objectsToBuild = filteredObjects.map(obj => {
    const [, remoteType] = obj.id.match(idPattern) || []

    if (remoteType === `InventoryLevel`) {
      return {
        ...obj,
        location: {
          id: createNodeId(obj.location.id, gatsbyApi, pluginOptions),
        },
      }
    } else {
      return obj
    }
  })

  /**
   * We will need to attach presentmentPrices here as a simple array.
   * To achieve that, we could go through the results backwards and
   * save the ProductVariantPricePair records to a map that's keyed
   * by the variant ID, which can be obtained by reading the __parentId
   * field of the ProductVariantPricePair record.
   *
   * We do similar processing to collect the product IDs for a collection,
   * so please see the processors/collections.ts for reference.
   */

  return objectsToBuild.map(builder.buildNode)
}
