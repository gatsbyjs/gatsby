const _ = require(`lodash`)

module.exports = (state = {}, action) => {
  let newState
  switch (action.type) {
    case `DELETE_CACHE`:
      return {}
    case `CREATE_NODE`:
    case `ADD_FIELD_TO_NODE`:
    case `ADD_CHILD_NODE_TO_PARENT_NODE`:
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
