module.exports = (state = { sourcePlugins: {} }, action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return {}
    case `UPDATE_PLUGINS_HASH`:
      return {
        ...state,
        PLUGINS_HASH: action.payload,
      }
    default:
      return state
  }
}
