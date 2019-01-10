const getNodesOfType = (node, state) => {
  const { type } = node.internal
  if (!state.has(type)) {
    state.set(type, new Map())
  }
  return state.get(type)
}

module.exports = (state = new Map(), action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return new Map()

    case `CREATE_NODE`: {
      const node = action.payload
      const nodesOfType = getNodesOfType(node, state)
      nodesOfType.set(node.id, node)
      return state
    }

    case `ADD_FIELD_TO_NODE`:
    case `ADD_CHILD_NODE_TO_PARENT_NODE`: {
      const node = action.payload
      const nodesOfType = getNodesOfType(node, state)
      nodesOfType.set(node.id, node)
      return state
    }

    case `DELETE_NODE`: {
      const node = action.payload
      const nodesOfType = getNodesOfType(node, state)
      nodesOfType.delete(node.id)
      return state
    }

    // TODO: Payload should be nodes, not ids
    case `DELETE_NODES`: {
      const ids = action.payload
      ids.forEach(id => {
        state.values().some(nodesOfType => {
          const node = nodesOfType.find(node => node.id === id)
          if (node) {
            nodesOfType.delete(id)
            return true
          }
          return false
        })
      })
      return state
    }

    default:
      return state
  }
}
