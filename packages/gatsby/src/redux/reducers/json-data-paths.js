// const omit = require(`lodash/omit`)

module.exports = (state = {}, action) => {
  switch (action.type) {
    // case `DELETE_ALL_JSON_DATA_PATHS`:
    //   return {}
    case `SET_JSON_DATA_PATH`:
      state[action.payload.key] = action.payload.value
      return state
    // case `DELETE_JSON_DATA_PATH`:
    //   return omit(state, action.payload)
    default:
      return state
  }
}
