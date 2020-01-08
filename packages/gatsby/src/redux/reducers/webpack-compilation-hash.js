module.exports = (state = ``, action) => {
  switch (action.type) {
    case `SET_WEBPACK_COMPILATION_HASH`:
      return action.payload
    default:
      return state
  }
}
