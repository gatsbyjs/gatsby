const fromPaths = new Set()

module.exports = (state = [], action) => {
  switch (action.type) {
    case `CREATE_REDIRECT`: {
      if (!fromPaths.has(action.payload.fromPath)) {
        // Add redirect only if it wasn't yet added to prevent duplicates
        fromPaths.add(action.payload.fromPath)
        state.push(action.payload)
        return state
      }
      return state
    }

    default:
      return state
  }
}
