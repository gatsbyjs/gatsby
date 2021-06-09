import { NodeInput, SourceNodesArgs } from "gatsby";
import { pattern as idPattern, createNodeId } from "../node-builder";

export function collectionsProcessor(
  objects: BulkResults,
  builder: NodeBuilder,
  gatsbyApi: SourceNodesArgs,
  pluginOptions: ShopifyPluginOptions
): Promise<NodeInput>[] {
  const promises = [];
  const collectionProductIndex: { [collectionId: string]: string[] } = {};

  /**
   * Read results in reverse so we can collect child node IDs.
   * See Shopify Bulk Operation guide for more info.
   *
   * https://shopify.dev/tutorials/perform-bulk-operations-with-admin-api#download-result-data
   */
  for (let i = objects.length - 1; i >= 0; i--) {
    const result = objects[i];
    const [id, remoteType] = result.id.match(idPattern) || [];
    if (remoteType === `Product`) {
      /**
       * We source products in a separate operation. Here we are
       * just collecting product IDs so we can tell Gatsby about
       * the many-to-many relationship between collections and
       * products.
       */
      if (!collectionProductIndex[result.__parentId]) {
        collectionProductIndex[result.__parentId] = [];
      }

      collectionProductIndex[result.__parentId].unshift(
        createNodeId(id, gatsbyApi, pluginOptions)
      );
    }

    if (remoteType === `Metafield`) {
      promises.push(builder.buildNode(result));
    }

    if (remoteType == `Collection`) {
      result.productIds = collectionProductIndex[result.id] || [];
      promises.push(builder.buildNode(result));
    }
  }

  return promises;
}
