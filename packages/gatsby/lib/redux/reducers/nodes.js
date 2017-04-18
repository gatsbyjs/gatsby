const fs = require("fs")
const _ = require("lodash")

const saveState = _.debounce(state => {
  console.log("===============saving node state")
  fs.writeFile(`${process.cwd()}/.cache/node-data.json`, JSON.stringify(state))
}, 1000)

module.exports = (state = {}, action) => {
  let newState
  switch (action.type) {
    case "CREATE_NODE":
      newState = {
        ...state,
        [action.payload.id]: action.payload,
      }
      saveState(newState)
      return newState
    case "UPDATE_NODE":
      newState = {
        ...state,
        [action.payload.id]: action.payload,
      }
      saveState(newState)
      return newState
    default:
      return state
  }
}
