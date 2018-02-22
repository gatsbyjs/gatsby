const _ = require(`lodash`)

const parentChildrenMap = new Map()

module.exports = (state = {}, action) => {
  let newState
  switch (action.type) {
    case `DELETE_CACHE`:
      return {}
    case `CREATE_NODE`: {
      // Remove any previously created descendant nodes as they're all due to be
      // recreated.
      const findChildrenRecursively = (children = []) => {
        children = children.concat(
          ...children.map(child => {
            const newChildren = parentChildrenMap.get(child)
            parentChildrenMap.delete(child)
            if (newChildren) {
              return findChildrenRecursively(newChildren)
            } else {
              return []
            }
          })
        )

        return children
      }

      const descendantNodes = findChildrenRecursively(
        parentChildrenMap.get(action.payload.id)
      )
      parentChildrenMap.delete(action.payload.id)
      newState = _.omit(state, descendantNodes)

      newState = {
        ...newState,
        [action.payload.id]: action.payload,
      }
      return newState
    }

    case `ADD_FIELD_TO_NODE`:
    case `ADD_CHILD_NODE_TO_PARENT_NODE`:
      parentChildrenMap.set(action.payload.id, action.payload.children)
      newState = {
        ...state,
        [action.payload.id]: action.payload,
      }
      return newState

    case `DELETE_NODE`:
      newState = _.omit(state, action.payload)
      return newState

    case `DELETE_NODES`:
      newState = _.omit(state, action.payload)
      return newState

    default:
      return state
  }
}
