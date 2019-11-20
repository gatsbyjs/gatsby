module.exports = (state = new Set(), action) => {
  switch (action.type) {
    case `CREATE_NODE`:
      state.add(action.payload.id)
      return state

    case `TOUCH_NODE`:
      state.add(action.payload)
      return state

    case `CLEAR_TOUCHED_NODES`:
      return new Set()

    default:
      return state
  }
}
