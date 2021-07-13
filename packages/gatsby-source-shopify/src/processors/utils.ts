import { pattern as idPattern } from "../node-builder"

export function getObjectsByType(
  objects: BulkResults,
  shopifyType: string
): BulkResults {
  return objects.filter(obj => {
    const [, remoteType] = obj.id.match(idPattern) || []

    return remoteType === shopifyType
  })
}
