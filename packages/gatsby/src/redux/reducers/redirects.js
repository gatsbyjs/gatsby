module.exports = (state = new Map(), action) => {
  switch (action.type) {
    case `CREATE_REDIRECT`: {
      if (!state.has(action.payload.fromPath)) {
        // Add redirect only if it wasn't yet added to prevent duplicates
        state.set(action.payload.fromPath, action.payload)
      }

      return state
    }

    default:
      return state
  }
}
