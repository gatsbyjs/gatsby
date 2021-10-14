import reducerRegistry from "../reducerRegistry"
import { createActionName } from "../utils"
import dummyData from "../data/dummy.json"
// Imports expensive 3rd party library.
// eslint-disable-next-line
import nodeLibs from "node-libs-browser"

// Set initial state for this slice of the store.
const initialState = {
  data: [],
  isLoaded: false,
}

// Give the reducer a unique name.
const reducerName = "dummyData"

// Create a name for the action type.
export const LOAD_DATA = createActionName(reducerName)

export const loadData = isLoaded => ({
  type: LOAD_DATA,
  isLoaded,
})

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_DATA:
      // Set isLoaded value and attached expensive JSON file.
      return { ...state, data: dummyData, isLoaded: action.isLoaded }
    default:
      return state
  }
}

reducerRegistry.register(reducerName, reducer)
