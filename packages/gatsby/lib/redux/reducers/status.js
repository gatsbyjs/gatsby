module.exports = (state = {}, action) => {
  switch (action.type) {
    case "UPDATE_SOURCE_PLUGIN_STATUS":
      return {
        ...state,
        [action.payload.plugin]: action.payload.status,
      }
    default:
      return state
  }
}
