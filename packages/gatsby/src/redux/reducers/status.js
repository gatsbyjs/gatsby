module.exports = (state = { sourcePlugins: {} }, action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return {}
    case `UPDATE_SOURCE_PLUGIN_STATUS`:
      return {
        ...state,
        sourcePlugins: {
          ...state.sourcePlugins,
          [action.payload.plugin]: action.payload.status,
        },
      }
    case `UPDATE_PLUGINS_HASH`:
      return {
        ...state,
        PLUGINS_HASH: action.payload,
      }
    default:
      return state
  }
}
