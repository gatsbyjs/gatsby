interface NodeStore {
  getNodes: () => any[]
  getNode: (id: string) => any | undefined
  getNodesByType: (type: string) => any[]
  getTypes: () => string[]
  hasNodeChanged: (id: string, digest: string) => boolean
  getNodeAndSavePathDependency: (id: string, path: string) => any | undefined
  // XXX(freiksenet): types
  runQuery: (...args: any[]) => any | undefined
  findRootNodeAncestor: (...args: any[]) => any | undefined
}
