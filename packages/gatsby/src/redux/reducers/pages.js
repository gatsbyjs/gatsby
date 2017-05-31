const _ = require(`lodash`)

// TODO to get page hot reloading working
// need to be able to get list of plugins that implement
// createPages and then get list of their pages, call "createPages"
// again, do diff on what wasn't added this time, and then delete
// those.
//
// This would be relatively easy with the API refactor suggested
// by 0x80 as exact implementors known ahead of time.

module.exports = (state = [], action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return []
    case `CREATE_PAGE`:
      const index = _.findIndex(state, p => p.path === action.payload.path)
      // If the path already exists, overwrite it.
      // Otherwise, add it to the end.
      if (index !== -1) {
        return [
          ...state
            .slice(0, index)
            .concat(action.payload)
            .concat(state.slice(index + 1)),
        ]
      } else {
        return [...state.concat(action.payload)]
      }
    case `DELETE_PAGE`:
      return state.filter(p => p.path !== action.payload.path)
    default:
      return state
  }
}
