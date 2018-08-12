const _ = require(`lodash`)
const normalize = require(`normalize-path`)

module.exports = (state = new Map(), action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return new Map()
    case `CREATE_PAGE`:
      action.payload.componentPath = normalize(action.payload.component)
      state.set(
        action.payload.componentPath,
        _.merge({ query: `` }, state.get(action.payload.componentPath), {
          componentPath: action.payload.componentPath,
        })
      )
      return state
    case `DELETE_PAGE`:
      action.payload.componentPath = normalize(action.payload.component)
      state.delete(action.payload.componentPath)
      return state
    case `REMOVE_TEMPLATE_COMPONENT`:
      state.delete(normalize(action.payload.componentPath))
      return state
    case `REPLACE_COMPONENT_QUERY`:
      action.payload.componentPath = normalize(action.payload.componentPath)
      state.set(action.payload.componentPath, {
        ...state.get(action.payload.componentPath),
        query: action.payload.query,
      })
      return state
  }

  return state
}
