const _ = require(`lodash`)

module.exports = (state = { nodes: {}, connections: {} }, action) => {
  switch (action.type) {
    case `ADD_PAGE_DEPENDENCY`:
      if (action.payload.path === ``) {
        return state
      }

      // If this nodeId not set yet.
      if (action.payload.nodeId) {
        let existingPaths = []
        if (state.nodes[action.payload.nodeId]) {
          existingPaths = state.nodes[action.payload.nodeId]
        }
        const newPaths = _.uniq(existingPaths.concat(action.payload.path))
        state.nodes[action.payload.nodeId] = newPaths
      }

      // If this connection not set yet.
      if (action.payload.connection) {
        let existingPaths = []
        if (state.connections[action.payload.connection]) {
          existingPaths = state.connections[action.payload.connection]
        }
        const newPaths = _.uniq(existingPaths.concat(action.payload.path))
        state.connections[action.payload.connection] = newPaths
      }

      return state
    case `REMOVE_PAGES_DATA_DEPENDENCIES`:
      state.nodes = _.mapValues(state.nodes, paths => {
        return _.difference(paths, action.payload.paths)
      })
      state.connections = _.mapValues(state.connections, paths => {
        return _.difference(paths, action.payload.paths)
      })

      return state
    default:
      return state
  }
}
