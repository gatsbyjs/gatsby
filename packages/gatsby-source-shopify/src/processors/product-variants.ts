import { NodeInput } from "gatsby"
import { pattern as idPattern } from "../node-builder"

export function productVariantsProcessor(
  objects: BulkResults,
  builder: NodeBuilder
): Array<Promise<NodeInput>> {
  return [...process(objects, builder)]
}

function* process(
  objects: BulkResults,
  builder: NodeBuilder
): Generator<Promise<NodeInput>> {
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

  for (const obj of objects) {
    const [, remoteType] = obj.id.match(idPattern) || []

    if (remoteType !== `Product`) {
      yield builder.buildNode(obj)
    }
  }
}
