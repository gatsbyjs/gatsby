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

  const variants = objects.filter(obj => {
    const [, remoteType] = obj.id.match(idPattern) || []

    return remoteType === `ProductVariant`
  })

  const productNodeIds = products.map(product =>
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
    .filter(node => {
      const index = productNodeIds.indexOf(node.productId as string)
      if (index >= 0) {
        const product = products[index]
        const variantIds = variants
          .filter(v => v.__parentId === product.id)
          .map(v => createNodeId(v.id, gatsbyApi, pluginOptions))

        if (!variantIds.includes(node.id)) {
          console.info(`Found a variant to delete!`, node, product)
          return true
        }
      }

      return false
    })

  variantsToDelete.forEach(variant => {
    gatsbyApi.actions.deleteNode(variant)
  })

  const imagesToDelete = gatsbyApi
    .getNodesByType(`${typePrefix}ShopifyProductImage`)
    .filter(node => productNodeIds.includes(node.productId as string))

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

  const objectsToBuild = objects.filter(obj => {
    const [, remoteType] = obj.id.match(idPattern) || []

    return remoteType !== `ProductVariant`
  })

  return objectsToBuild.map(builder.buildNode)
}
