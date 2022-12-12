import { IGatsbyNode } from "../redux/types"
import { getDataStore } from "./datastore"

export { getDataStore } from "./datastore"

// Convenience accessor methods

/**
 * Get all nodes from datastore.
 * @deprecated
 */
export const getNodes = (): Array<IGatsbyNode> => getDataStore().getNodes()

/**
 * Get node by id from datastore.
 */
export const getNode = (id: string): IGatsbyNode | undefined =>
  getDataStore().getNode(id)

/**
 * Get all nodes of type from datastore.
 * @deprecated
 */
export const getNodesByType = (type: string): Array<IGatsbyNode> =>
  getDataStore().getNodesByType(type)

/**
 * Get all type names from datastore.
 */
export const getTypes = (): Array<string> => getDataStore().getTypes()
