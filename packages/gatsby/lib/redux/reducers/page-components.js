const _ = require("lodash")

module.exports = (state = {}, action) => {
  switch (action.type) {
    case "ADD_PAGE_COMPONENT":
      if (!_.has(state, `action.payload.componentPath`)) {
        state[action.payload.componentPath] = {
          componentPath: action.payload.componentPath,
          initialQueryRunComplete: false,
        }
      }
      return state
    case "SET_PAGE_COMPONENT_QUERY":
      state[action.payload.componentPath] = {
        ...state[action.payload.componentPath],
        query: action.payload.query,
      }
      return state
  }

  return state
}
