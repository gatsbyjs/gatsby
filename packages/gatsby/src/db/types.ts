import { GraphQLType } from "graphql"
import { Node } from "../../index"

export interface INodeStore {
  getNodes: () => Node[]
  getNode: (id: string) => Node | undefined
  getNodesByType: (type: string) => Node[]
  getTypes: () => string[]
  hasNodeChanged: (id: string, digest: string) => boolean
  getNodeAndSavePathDependency: (id: string, path: string) => Node | undefined
  runQuery: (args: {
    gqlType: GraphQLType
    queryArgs: Record<string, any>
    firstOnly: boolean
    resolvedFields: Record<string, any>
    nodeTypeNames: string[]
  }) => any | undefined
}
