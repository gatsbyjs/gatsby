const _ = require(`lodash`)

const { emitter, store } = require(`../redux`)
const apiRunnerNode = require(`../utils/api-runner-node`)
const { boundActionCreators } = require(`../redux/actions`)
const { deletePage, deleteComponentsDependencies } = boundActionCreators

let pagesDirty = false
let graphql

emitter.on(`CREATE_NODE`, action => {
  if (action.payload.internal.type !== `SitePage`) {
    pagesDirty = true
  }
})
emitter.on(`DELETE_NODE`, action => {
  pagesDirty = true
  debouncedCreatePages()
})

emitter.on(`API_RUNNING_QUEUE_EMPTY`, () => {
  if (pagesDirty) {
    debouncedCreatePages()
  }
})

const runCreatePages = async () => {
  pagesDirty = false
  const plugins = store.getState().plugins
  // Test which plugins implement createPagesStatefully so we can
  // ignore their pages.
  const statefulPlugins = plugins
    .filter(p => {
      try {
        const gatsbyNode = require(`${p.resolve}/gatsby-node`)
        if (gatsbyNode.createPagesStatefully) {
          return true
        } else {
          return false
        }
      } catch (e) {
        return false
      }
    })
    .map(p => p.id)

  const timestamp = new Date().toJSON()

  await apiRunnerNode(`createPages`, {
    graphql,
    traceId: `createPages`,
    waitForCascadingActions: true,
  })

  // Delete pages that weren't updated when running createPages.
  store
    .getState()
    .pages.filter(p => !_.includes(statefulPlugins, p.pluginCreatorId))
    .filter(p => p.updatedAt < timestamp)
    .forEach(page => {
      deleteComponentsDependencies([page.path])
      deletePage(page)
    })
}

const debouncedCreatePages = _.debounce(runCreatePages, 100)

module.exports = graphqlRunner => {
  graphql = graphqlRunner
}
