module.exports = (state = new Map(), action) => {
  switch (action.type) {
    case `ADD_PAGE_DATA_STATS`:
      state.set(action.payload.filePath, action.payload.size)
      return state
    default:
      return state
  }
}
