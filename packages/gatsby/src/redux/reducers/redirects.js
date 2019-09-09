const fromPaths = new Set()

module.exports = (state = [], action) => {
  switch (action.type) {
    case `CREATE_REDIRECT`: {
      const { fromPath } = action.payload

      // Add redirect only if it wasn't yet added to prevent duplicates
      if (!fromPaths.has(fromPath)) {
        fromPaths.add(fromPath)

        state.push(action.payload)
      }

      return state
    }

    default:
      return state
  }
}
