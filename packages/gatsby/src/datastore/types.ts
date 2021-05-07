import { Database } from "lmdb-store"
import { IGatsbyNode } from "../redux/types"

export type NodeId = string
export type NodeType = string

export interface ILmdbDatabases {
  nodes: Database<IGatsbyNode, NodeId>
  nodesByType: Database<NodeId, NodeType>
}

export interface IDataStore {
  hasNodeChanged(id: string, digest: string): boolean
  getNode(id: string): IGatsbyNode | undefined
  getTypes(): Array<string>
  ready(): Promise<void>

  /** @deprecated */
  getNodes(): Array<IGatsbyNode>
  /** @deprecated */
  getNodesByType(type: string): Array<IGatsbyNode>
}
