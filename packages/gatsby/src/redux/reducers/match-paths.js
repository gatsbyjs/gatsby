const _ = require(`lodash`)

module.exports = (state = {}, action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return {}
    case `CREATE_PAGE`: {
      const page = action.payload
      if (page.matchPath) {
        const { oldPage } = action
        const newState = { ...state }
        if (oldPage && oldPage.matchPath !== page.matchPath) {
          delete newState.matchMaths[oldPage.matchPath]
        }
        newState[page.matchPath] = page.path
        return newState
      } else {
        return state
      }
    }
    case `DELETE_PAGE`: {
      const page = action.payload
      if (page.matchPath) {
        return _.omit(state, [page.matchPath])
      } else {
        return state
      }
    }
    default:
      return state
  }
}
