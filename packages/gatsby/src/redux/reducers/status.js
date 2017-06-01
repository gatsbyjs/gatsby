const _ = require(`lodash`)

module.exports = (state = { plugins: {} }, action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return { plugins: {} }
    case `UPDATE_PLUGINS_HASH`:
      return {
        ...state,
        PLUGINS_HASH: action.payload,
      }
    case `SET_PLUGIN_STATUS`:
      if (!action.plugin && !action.plugin.name) {
        throw new Error(`You can't set plugin status without a plugin`)
      }
      if (!_.isObject(action.payload)) {
        throw new Error(
          `You must pass an object into setPluginStatus. What was passed in was ${JSON.stringify(action.payload, null, 4)}`
        )
      }
      return {
        ...state,
        plugins: {
          ...state.plugins,
          [action.plugin.name]: _.merge(
            {},
            state.plugins[action.plugin.name],
            action.payload
          ),
        },
      }
    default:
      return state
  }
}
