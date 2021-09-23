import _ from "lodash"
import { ActionsUnion, IGatsbyState } from "../types"

const defaultState: IGatsbyState["status"] = {
  PLUGINS_HASH: ``,
  LAST_NODE_COUNTER: 0,
  plugins: {},
}

export const statusReducer = (
  state: IGatsbyState["status"] = defaultState,
  action: ActionsUnion
): IGatsbyState["status"] => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return defaultState
    case `UPDATE_PLUGINS_HASH`:
      return {
        ...state,
        PLUGINS_HASH: action.payload,
      }
    case `SET_PLUGIN_STATUS`:
      if (!action.plugin || !action.plugin?.name) {
        throw new Error(`You can't set plugin status without a plugin`)
      }
      if (!_.isObject(action.payload)) {
        throw new Error(
          `You must pass an object into setPluginStatus. What was passed in was ${JSON.stringify(
            action.payload,
            null,
            4
          )}`
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
    case `CREATE_NODE`:
      state.LAST_NODE_COUNTER = action.payload.internal.counter
      return state
    case `CLEAR_PLUGIN_STATUS`:
      // console.log(`deleting plugin status for`, action.payload)
      delete state.plugins[action.payload]
      return state
    default:
      return state
  }
}
