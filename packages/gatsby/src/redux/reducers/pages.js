const normalize = require(`normalize-path`)
const profile = require(`../../utils/profile`)

module.exports = (state = new Map(), action) => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return new Map()
    case `CREATE_PAGE`: {
      const start = process.hrtime()
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

      state.set(action.payload.path, action.payload)
      profile({
        start,
        name: `reducers/pages`,
        parent: `site createPages`,
      })
      return state
    }
    case `DELETE_PAGE`: {
      state.delete(action.payload.path)
      return state
    }
    default:
      return state
  }
}
