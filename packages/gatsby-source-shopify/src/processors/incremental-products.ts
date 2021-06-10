import { NodeInput, SourceNodesArgs } from "gatsby"
import { pattern as idPattern, createNodeId } from "../node-builder"

export function incrementalProductsProcessor(
  objects: BulkResults,
  builder: NodeBuilder,
  gatsbyApi: SourceNodesArgs,
  pluginOptions: ShopifyPluginOptions
): Array<Promise<NodeInput>> {
  const { typePrefix = `` } = pluginOptions
  const products = objects.filter(obj => {
    const [, remoteType] = obj.id.match(idPattern) || []

    return remoteType === `Product`
  })

  const nodeIds = products.map(product =>
    createNodeId(product.id, gatsbyApi, pluginOptions)
  )

  /**
   * The events API doesn't tell us about deleted variants or images, so when we
   * get the list of changed products, we have to compare those product
   * variants/images with what we have in the cache, and delete those that are
   * not present in the newer API results.
   */
  const variantsToDelete = gatsbyApi
    .getNodesByType(`${typePrefix}ShopifyProductVariant`)
    .filter(node => nodeIds.includes(node.productId as string))

  variantsToDelete.forEach(variant => {
    gatsbyApi.actions.deleteNode(variant)
  })

  const imagesToDelete = gatsbyApi
    .getNodesByType(`${typePrefix}ShopifyProductImage`)
    .filter(node => nodeIds.includes(node.productId as string))

  imagesToDelete.forEach(image => {
    gatsbyApi.actions.deleteNode(image)
  })

  /**
   * Additionally, product variants have metafields attached to them, so
   * we must delete those as well to avoid oprhaned nodes building up in
   * the cache.
   */
  const variantIds = variantsToDelete.map(v => v.id)
  gatsbyApi
    .getNodesByType(`${typePrefix}ShopifyProductVariantMetafield`)
    .forEach(metafield => {
      if (variantIds.includes(metafield.productVariantId as string)) {
        gatsbyApi.actions.deleteNode(metafield)
      }
    })

  return objects.map(builder.buildNode)
}
