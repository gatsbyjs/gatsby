import { IGatsbyState, ITouchNodeOptOutType } from "../types"

/**
 * Takes in a domain and headers for that domain, from the setRequestHeaders action, and stores them in a Map to be accessed when making requests.
 */
export const touchNodeOptOutReducer = (
  state: IGatsbyState["touchNodeOptOutTypes"] = new Set(),
  action: ITouchNodeOptOutType
): IGatsbyState["touchNodeOptOutTypes"] => {
  switch (action.type) {
    case `ADD_TOUCH_NODE_OPTOUT_TYPE`: {
      const { typeName } = action.payload

      state.add(typeName)
      return state
    }
    default:
      return state
  }
}
