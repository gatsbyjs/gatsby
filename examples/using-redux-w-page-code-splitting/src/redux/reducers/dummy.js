import dummyData from "../data/dummy.json"
// Imports expensive 3rd party library.
import nodeLibs from "node-libs-browser"

const initialState = {
  data: null,
  isLoaded: false,
}

const LOAD_DATA = "LOAD_DATA"

export const loadData = isLoaded => ({
  type: LOAD_DATA,
  isLoaded,
})

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_DATA:
      // Set isLoaded value and attached expensive JSON file.
      return { ...state, data: dummyData, isLoaded: action.isLoaded }
    default:
      return state
  }
}
