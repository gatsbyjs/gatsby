const normalize = require(`normalize-path`)

const stateToMap = state => {
  let stateMap = new Map()
  state.forEach(payload => stateMap.set(payload.path, payload))
  return stateMap
}

module.exports = (state = [], action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return []
    case `CREATE_PAGE`: {
      action.payload.component = normalize(action.payload.component)
      if (!action.plugin && !action.plugin.name) {
        console.log(``)
        console.error(JSON.stringify(action, null, 4))
        console.log(``)
        throw new Error(
          `Pages can only be created by plugins. There wasn't a plugin set
        when creating this page.`
        )
      }
      // Link page to its plugin.
      action.payload.pluginCreator___NODE = action.plugin.id
      action.payload.pluginCreatorId = action.plugin.id

      let stateMap = stateToMap(state)
      stateMap.set(action.payload.path, action.payload)
      return Array.from(stateMap.values())
    }
    case `DELETE_PAGE`: {
      let stateMap = stateToMap(state)
      stateMap.delete(action.payload.path)
      return Array.from(stateMap.values())
    }
    default:
      return state
  }
}
