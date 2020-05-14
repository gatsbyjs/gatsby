import { IGatsbyState, ActionsUnion } from "../types"

export const componentDataDependenciesReducer = (
  state: IGatsbyState["componentDataDependencies"] = {
    nodes: new Map(),
    connections: new Map(),
  },
  action: ActionsUnion
): IGatsbyState["componentDataDependencies"] => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return { nodes: new Map(), connections: new Map() }
    case `CREATE_COMPONENT_DEPENDENCY`:
      if (action.payload.path === ``) {
        return state
      }

      // If this nodeId not set yet.
      if (action.payload.nodeId) {
        let existingPaths: Set<string> = new Set()
        if (state.nodes.has(action.payload.nodeId)) {
          existingPaths = state.nodes.get(action.payload.nodeId)!
        }
        if (!existingPaths.has(action.payload.path)) {
          existingPaths.add(action.payload.path)
        }
        state.nodes.set(action.payload.nodeId, existingPaths)
      }

      // If this connection not set yet.
      if (action.payload.connection) {
        let existingPaths: Set<string> = new Set()
        if (state.connections.has(action.payload.connection)) {
          existingPaths = state.connections.get(action.payload.connection)!
        }
        if (!existingPaths.has(action.payload.path)) {
          existingPaths.add(action.payload.path)
        }
        state.connections.set(action.payload.connection, existingPaths)
      }

      return state
    case `DELETE_COMPONENTS_DEPENDENCIES`:
      state.nodes.forEach(val => {
        for (const path of action.payload.paths) {
          val.delete(path)
        }
      })
      state.connections.forEach(val => {
        for (const path of action.payload.paths) {
          val.delete(path)
        }
      })

      return state
    // Don't delete data dependencies as we're now deleting transformed nodes
    // when their parent is changed. WIth the code below as stands, this
    // would delete the connection between the page and the transformed
    // node which will be recreated after its deleted meaning the query
    // won't be re-run.
    // case `DELETE_NODE`:
    // delete state.nodes[action.payload]
    // return state
    // case `DELETE_NODES`:
    // action.payload.forEach(n => delete state.nodes[n])
    // return state
    default:
      return state
  }
}
