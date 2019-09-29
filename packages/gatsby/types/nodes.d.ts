import { GraphQLType } from "graphql"

interface NodeStore {
  getNodes: () => any[]
  getNode: (id: string) => any | undefined
  getNodesByType: (type: string) => any[]
  getTypes: () => string[]
  hasNodeChanged: (id: string, digest: string) => boolean
  getNodeAndSavePathDependency: (id: string, path: string) => any | undefined
  // XXX(freiksenet): types
  runQuery: (args: {
    gqlType: GraphQLType
    queryArgs: Object
    firstOnly: boolean
    resolvedFields: Object
    nodeTypeNames: Array<string>
  }) => any | undefined
  findRootNodeAncestor: (...args: any[]) => any | undefined
}
