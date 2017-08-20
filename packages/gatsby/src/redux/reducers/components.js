const _ = require(`lodash`)
const normalize = require(`normalize-path`)

module.exports = (state = {}, action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return {}
    case `CREATE_PAGE`:
    case `CREATE_LAYOUT`:
      action.payload.componentPath = normalize(
        Array.isArray(action.payload.component)
          ? action.payload.component[0]
          : action.payload.component
      )
      state[action.payload.componentPath] = _.merge(
        {},
        state[action.payload.componentPath],
        {
          componentPath: action.payload.componentPath,
        }
      )
      return state
    case `REPLACE_COMPONENT_QUERY`:
      action.payload.componentPath = normalize(action.payload.componentPath)
      state[action.payload.componentPath] = {
        ...state[action.payload.componentPath],
        query: action.payload.query,
      }
      return state
  }

  return state
}
