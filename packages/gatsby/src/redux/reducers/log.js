module.exports = (state = () => {}, action) => {
  switch (action.type) {
    case `SET_LOGGER`:
      return action.payload

    default:
      return state
  }
}
