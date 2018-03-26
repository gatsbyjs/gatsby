// const omit = require(`lodash/omit`)

module.exports = (state = {}, action) => {
  switch (action.type) {
    // case `DELETE_ALL_JSON_DATA_PATHS`:
    //   return {}
    case `SET_JSON_DATA_PATH`:
      return {
        ...state,
        ...action.payload,
      }
    // case `DELETE_JSON_DATA_PATH`:
    //   return omit(state, action.payload)
    default:
      return state
  }
}
