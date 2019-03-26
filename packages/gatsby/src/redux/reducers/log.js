module.exports = (state = null, action) => {
  switch (action.type) {
    case `SET_LOGGER`:
      return action.payload

    default:
      return state
  }
}
