const _ = require(`lodash`)

/*
 * Explicitly add redirect with and without trailing slash
 */
module.exports = (state = [], action) => {
  switch (action.type) {
    case `CREATE_REDIRECT`: {
      const filtered = action.payload.filter(redirect => !state.find(existing => _.isEqual(existing, redirect)))
      if (filtered.length > 0) {
        return [...state, ...action.payload]
      }
      return state
    }

    default:
      return state
  }
}
