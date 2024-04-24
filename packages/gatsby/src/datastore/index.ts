import type { IGatsbyNode } from "../redux/types";
import { getDataStore } from "./datastore";

export { getDataStore } from "./datastore";

// Convenience accessor methods

/**
 * Get all nodes from datastore.
 * @deprecated
 */
export function getNodes(): Array<IGatsbyNode> {
  return getDataStore().getNodes();
}

/**
 * Get node by id from datastore.
 */
export function getNode(id: string): IGatsbyNode | undefined {
  return getDataStore().getNode(id);
}

/**
 * Get all nodes of type from datastore.
 * @deprecated
 */
export function getNodesByType(type: string): Array<IGatsbyNode> {
  return getDataStore().getNodesByType(type);
}

/**
 * Get all type names from datastore.
 */
export function getTypes(): Array<string> {
  return getDataStore().getTypes();
}
