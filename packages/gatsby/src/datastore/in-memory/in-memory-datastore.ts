import { IDataStore, IGatsbyIterable } from "../types"
import { store } from "../../redux"
import { IGatsbyNode } from "../../redux/types"
import { GatsbyIterable } from "../common/iterable"

/**
 * @deprecated
 */
function getNodes(): Array<IGatsbyNode> {
  const nodes = store.getState().nodes ?? new Map()
  return Array.from(nodes.values())
}

/**
 * @deprecated
 */
function getNodesByType(type: string): Array<IGatsbyNode> {
  const nodes = store.getState().nodesByType.get(type) ?? new Map()
  return Array.from(nodes.values())
}

function iterateNodes(): IGatsbyIterable<IGatsbyNode> {
  const nodes = store.getState().nodes ?? new Map()
  return new GatsbyIterable(nodes.values())
}

function iterateNodesByType(type: string): IGatsbyIterable<IGatsbyNode> {
  const nodes = store.getState().nodesByType.get(type) ?? new Map()
  return new GatsbyIterable(nodes.values())
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
    iterateNodes,
    iterateNodesByType,

    // deprecated:
    getNodes,
    getNodesByType,
  }
}
