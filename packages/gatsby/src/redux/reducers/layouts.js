const _ = require(`lodash`)
const normalize = require(`normalize-path`)

module.exports = (state = [], action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return []
    case `CREATE_LAYOUT`:
      action.payload.component = normalize(action.payload.component)
      action.payload.componentWrapperPath = normalize(
        action.payload.componentWrapperPath
      )
      if (!action.plugin && !action.plugin.name) {
        console.log(``)
        console.error(JSON.stringify(action, null, 4))
        console.log(``)
        throw new Error(`Pages can only be created by plugins. There wasn't a plugin set
        when creating this page.`)
      }
      action.payload.pluginCreator___NODE = `Plugin ${action.plugin.name}`
      const index = _.findIndex(state, l => l.id === action.payload.id)
      // If the id already exists, overwrite it.
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
    case `DELETE_LAYOUT`:
      return state.filter(l => l.id !== action.payload.id)
    default:
      return state
  }
}
