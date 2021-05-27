import { Database } from "lmdb-store"
import { IGatsbyNode } from "../redux/types"

export type NodeId = string
export type NodeType = string

export interface ILmdbDatabases {
  nodes: Database<IGatsbyNode, NodeId>
  nodesByType: Database<NodeId, NodeType>
}

export interface IDataStore {
  getNode(id: string): IGatsbyNode | undefined
  getTypes(): Array<string>
  countNodes(typeName?: string): number
  ready(): Promise<void>

  /** @deprecated */
  getNodes(): Array<IGatsbyNode>
  /** @deprecated */
  getNodesByType(type: string): Array<IGatsbyNode>
}
