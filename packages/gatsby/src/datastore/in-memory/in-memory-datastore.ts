import { IDataStore } from "../types"
import { store } from "../../redux"
import { IGatsbyNode } from "../../redux/types"

function getNodes(): Array<IGatsbyNode> {
  const nodes = store.getState().nodes
  if (nodes) {
    return Array.from(nodes.values())
  } else {
    return []
  }
}

function getNodesByType(type: string): Array<IGatsbyNode> {
  const nodes = store.getState().nodesByType.get(type)
  if (nodes) {
    return Array.from(nodes.values())
  } else {
    return []
  }
}

function getNode(id: string): IGatsbyNode | undefined {
  return store.getState().nodes.get(id)
}

function getTypes(): Array<string> {
  // Note: sorting to match the output of the LMDB version (where keys are sorted by default)
  return Array.from(store.getState().nodesByType.keys()).sort()
}

function countNodes(typeName?: string): number {
  if (!typeName) {
    return store.getState().nodes.size
  }
  const nodes = store.getState().nodesByType.get(typeName)
  return nodes ? nodes.size : 0
}

const readyPromise = Promise.resolve(undefined)

/**
 * Returns promise that resolves when the store is ready for reads
 * (the in-memory store is always ready)
 */
function ready(): Promise<void> {
  return readyPromise
}

export function setupInMemoryStore(): IDataStore {
  return {
    getNode,
    getTypes,
    countNodes,
    ready,

    // deprecated:
    getNodes,
    getNodesByType,
  }
}
