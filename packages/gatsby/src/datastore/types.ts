import { Database } from "lmdb-store"
import { IGatsbyNode } from "../redux/types"
import { GatsbyGraphQLType } from "../../index"
import { IInputQuery } from "./common/query"
import { IGraphQLRunnerStats } from "../query/types"

export type NodeId = string
export type NodeType = string

export interface ILmdbDatabases {
  nodes: Database<IGatsbyNode, NodeId>
  nodesByType: Database<NodeId, NodeType>
  indexes: Database<NodeId, Array<any>>
  metadata: Database<any, string>
}

export interface IRunQueryArgs {
  gqlType: GatsbyGraphQLType
  queryArgs: {
    filter: IInputQuery | undefined
    sort:
      | {
          fields: Array<string>
          order: Array<boolean | "asc" | "desc" | "ASC" | "DESC">
        }
      | undefined
    limit?: number
    skip?: number
  }
  firstOnly: boolean
  resolvedFields: Record<string, any>
  nodeTypeNames: Array<string>
  stats: IGraphQLRunnerStats
}

// Note: this type is compatible with lmdb-store ArrayLikeIterable
export interface IGatsbyIterable<T> extends Iterable<T> {
  [Symbol.iterator](): Iterator<T>
  map<U>(fn: (entry: T) => U): IGatsbyIterable<U>
  // concat<U>(other: Iterable<U>): Iterable<T | U>
  filter(predicate: (entry: T) => any): IGatsbyIterable<T>
  forEach(callback: (entry: T) => any): void
  //
  // mergeSorted<U = T>(
  //   other: Iterable<U>,
  //   comparator?: (a: T | U, b: T | U) => number
  // ): IGatsbyIterable<T | U>
  // intersectSorted<U = T>(
  //   other: Iterable<U>,
  //   comparator?: (a: T | U, b: T | U) => number
  // ): IGatsbyIterable<T | U>
  // deduplicateSorted(
  //   isEqual?: (prev: T, current: T) => boolean
  // ): IGatsbyIterable<T>
}

export interface IDataStore {
  getNode(id: string): IGatsbyNode | undefined
  getTypes(): Array<string>
  countNodes(typeName?: string): number
  ready(): Promise<void>
  iterateNodes(): IGatsbyIterable<IGatsbyNode>
  iterateNodesByType(type: string): IGatsbyIterable<IGatsbyNode>
  runQuery(args: IRunQueryArgs): Promise<Iterable<IGatsbyNode> | null>

  /** @deprecated */
  getNodes(): Array<IGatsbyNode>
  /** @deprecated */
  getNodesByType(type: string): Array<IGatsbyNode>
}
