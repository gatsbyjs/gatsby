interface NodeStore {
  getNodes: () => Array<any>
  getNode: (id: string) => any | undefined
  getNodesByType: (type: string) => Array<any>
  getTypes: () => Array<string>
  hasNodeChanged: (id: string, digest: string) => boolean
  getNodeAndSavePathDependency: (id: string, path: string) => any | undefined
  // XXX(freiksenet): types
  runQuery: (...args: any[]) => any | undefined
  findRootNodeAncestor: (...args: any[]) => any | undefined
}
