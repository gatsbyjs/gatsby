module.exports = (state = ``, action) => {
  switch (action.type) {
    case `SET_WEBPACK_CHUNK_GROUP_HASHES`:
      return action.payload
    default:
      return state
  }
}
