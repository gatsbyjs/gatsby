import { GraphQLOutputType } from "graphql"
import { Node } from "../../index"

type IDOrNode = string | { id: string }
type TypeOrTypeName = string | GraphQLOutputType

/**
 * Optional page dependency information.
 *
 * @typedef {Object} PageDependencies
 * @property {string} path The path of the page that depends on the retrieved nodes' data
 * @property {string} [connectionType] Mark this dependency as a connection
 */
interface PageDependencies {
  path: string
  connectionType?: string
}

interface QueryArguments {
  type: TypeOrTypeName
  query: { filter: Object; sort?: Object }
  firstOnly?: boolean
}

export interface NodeModel {
  getNodeById(
    arg1: { id: IDOrNode; type?: TypeOrTypeName },
    pageDependencies?: PageDependencies
  ): any | null
  getNodesByIds(
    arg1: { ids: Array<IDOrNode>; type?: TypeOrTypeName },
    pageDependencies?: PageDependencies
  ): any[]
  getAllNodes(
    arg1: { type?: TypeOrTypeName },
    pageDependencies?: PageDependencies
  ): any[]
  runQuery(
    args: QueryArguments,
    pageDependencies?: PageDependencies
  ): Promise<any>
  getTypes(): string[]
  trackPageDependencies<nodeOrNodes extends Node | Node[]>(
    result: nodeOrNodes,
    pageDependencies?: PageDependencies
  ): nodeOrNodes
}
