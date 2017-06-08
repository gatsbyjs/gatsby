const _ = require(`lodash`)

module.exports = (state = {}, action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return {}
    case `CREATE_PAGE_COMPONENT`:
      state[action.payload.componentPath] = _.merge(
        {},
        state[action.payload.componentPath],
        {
          componentPath: action.payload.componentPath,
        }
      )
      return state
    case `REPLACE_PAGE_COMPONENT_QUERY`:
      state[action.payload.componentPath] = {
        ...state[action.payload.componentPath],
        query: action.payload.query,
      }
      return state
  }

  return state
}
