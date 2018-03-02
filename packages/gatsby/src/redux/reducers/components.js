const _ = require(`lodash`)
const normalize = require(`normalize-path`)

module.exports = (state = {}, action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return {}
    case `CREATE_PAGE`:
    case `CREATE_LAYOUT`:
      action.payload.componentPath = normalize(action.payload.component)
      state[action.payload.componentPath] = _.merge(
        { query: `` },
        state[action.payload.componentPath],
        {
          componentPath: action.payload.componentPath,
        }
      )
      return state
    case `DELETE_PAGE`:
      action.payload.componentPath = normalize(action.payload.component)
      delete state[action.payload.componentPath]
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
