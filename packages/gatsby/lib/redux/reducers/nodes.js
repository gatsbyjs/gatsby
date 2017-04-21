const fs = require("fs")
const _ = require("lodash")

module.exports = (state = {}, action) => {
  let newState
  switch (action.type) {
    case "CREATE_NODE":
      newState = {
        ...state,
        [action.payload.id]: action.payload,
      }
      return newState
    case "UPDATE_NODE":
      newState = {
        ...state,
        [action.payload.id]: action.payload,
      }
      return newState
    default:
      return state
  }
}
