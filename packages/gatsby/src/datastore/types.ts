import { Database } from "lmdb-store"
import { IGatsbyNode } from "../redux/types"

export type NodeId = string
export type NodeType = string

export interface ILmdbDatabases {
  nodes: Database<IGatsbyNode, NodeId>
  nodesByType: Database<NodeId, NodeType>
}

export interface IQueryResult {
  entries: Iterable<IGatsbyNode>
  totalCount: number | (() => Promise<number>)
}

// Note: this type is compatible with lmdb-store ArrayLikeIterable
export interface IGatsbyIterable<T> extends Iterable<T> {
  [Symbol.iterator](): Iterator<T>
  map<U>(fn: (entry: T) => U): IGatsbyIterable<U>
  // concat<U>(other: Iterable<U>): Iterable<T | U>
  filter(predicate: (entry: T) => any): IGatsbyIterable<T>
  forEach(callback: (entry: T) => any): void
}

export interface IDataStore {
  getNode(id: string): IGatsbyNode | undefined
  getTypes(): Array<string>
  countNodes(typeName?: string): number
  ready(): Promise<void>
  iterateNodes(): IGatsbyIterable<IGatsbyNode>
  iterateNodesByType(type: string): IGatsbyIterable<IGatsbyNode>

  /** @deprecated */
  getNodes(): Array<IGatsbyNode>
  /** @deprecated */
  getNodesByType(type: string): Array<IGatsbyNode>
}
