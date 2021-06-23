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
  })
}
