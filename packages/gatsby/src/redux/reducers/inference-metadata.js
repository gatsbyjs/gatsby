// Tracking structure of nodes to utilize this metadata for schema inference
// Type descriptors stay relevant at any point in time making incremental inference trivial

const { addNode, deleteNode } = require(`../../schema/infer/node-descriptor`)

// FIXME: this has to be injected somehow
const ignoredFields = new Set([
  `id`,
  `parent`,
  `children`,
  `internal`,
  `$loki`,
  `__gatsby_resolved`,
])

module.exports = (state = {}, action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return {}

    case `CREATE_NODE`:
    case `ADD_FIELD_TO_NODE`: {
      const node = action.payload
      const { type } = node.internal
      state[type] = addNode(state[type] || { ignoredFields }, node)
      return state
    }

    case `DELETE_NODE`: {
      const node = action.payload
      if (!node) return state
      const { type } = node.internal
      state[type] = deleteNode(state[type] || { ignoredFields }, node)
      return state
    }

    case `ADD_CHILD_NODE_TO_PARENT_NODE`: {
      // TODO
      return state
    }

    // Deprecated, will be removed in Gatsby v3.
    case `DELETE_NODES`: {
      // TODO
      return state
    }

    case `SET_SCHEMA`: {
      Object.keys(state).forEach(type => {
        state[type].dirty = false
      })
      return state
    }

    default:
      return state
  }
}
