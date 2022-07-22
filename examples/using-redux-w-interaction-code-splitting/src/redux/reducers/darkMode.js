import reducerRegistry from "../reducerRegistry"
import { createActionName } from "../utils"

export const initialState = {
  isDarkMode: false,
}

const reducerName = "darkMode"

export const toggleDarkMode = isDarkMode => ({
  type: TOGGLE_DARKMODE,
  isDarkMode,
})

export const TOGGLE_DARKMODE = createActionName(reducerName)

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case TOGGLE_DARKMODE:
      return { ...state, isDarkMode: !state.isDarkMode }
    default:
      return state
  }
}

reducerRegistry.register(reducerName, reducer)
