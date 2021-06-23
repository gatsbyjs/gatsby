import { NodeInput, SourceNodesArgs } from "gatsby"
import { createNodeId } from "../node-builder"

export function productVariantsProcessor(
  objects: BulkResults,
  builder: NodeBuilder,
  gatsbyApi: SourceNodesArgs,
  pluginOptions: ShopifyPluginOptions
): Array<Promise<NodeInput>> {
  return objects.map(obj => {
    const { product, ...rest } = obj
    const productId = createNodeId(product.id, gatsbyApi, pluginOptions)
    return builder.buildNode({
      ...rest,
      productId,
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
  })
}
