module.exports = (state = [], action) => {
  switch (action.type) {
    case `LOG_MESSAGE`:
      return [...state, action.payload]
    default:
      return state
  }
}
