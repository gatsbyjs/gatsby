/**
 * Jobs of this module
 * - Ensure on bootstrap that all invalid page queries are run and report
 *   when this is done
 * - Watch for when a page's query is invalidated and re-run it.
 */

const _ = require(`lodash`)
const Promise = require(`bluebird`)

const { store, emitter } = require(`../../redux`)
const queryRunner = require(`./query-runner`)

let queuedDirtyActions = []

let active = false

exports.runQueries = async () => {
  active = true
  const state = store.getState()

  // Run queued dirty nodes now that we're active.
  queuedDirtyActions = _.uniq(queuedDirtyActions, a => a.payload.id)
  await findAndRunQueriesForDirtyPaths(queuedDirtyActions)

  // Find paths without data dependencies and run them (just in case?)
  const paths = findPathsWithoutDataDependencies()
  // Run these pages
  await Promise.all(
    paths.map(path => {
      const page = state.pages.find(p => p.path === path)
      const component = state.pageComponents[page.component]
      return queryRunner(page, component)
    })
  )
  return
}

emitter.on(`CREATE_NODE`, action => {
  queuedDirtyActions.push(action)
  debouncedProcessQueries()
})

const findPathsWithoutDataDependencies = () => {
  const state = store.getState()
  const allTrackedPaths = _.uniq(
    _.flatten(
      _.concat(
        _.values(state.pageDataDependencies.nodes),
        _.values(state.pageDataDependencies.connections)
      )
    )
  )

  // Get list of paths not already tracked and run the queries for these
  // paths.
  return _.difference(state.pages.map(p => p.path), allTrackedPaths)
}

const findAndRunQueriesForDirtyPaths = actions => {
  const state = store.getState()
  let dirtyPaths = []
  actions.forEach(action => {
    const node = state.nodes[action.payload.id]

    // Check if the node was deleted
    if (!node) {
      return
    }

    // Find invalid pages.
    if (state.pageDataDependencies.nodes[node.id]) {
      dirtyPaths = dirtyPaths.concat(state.pageDataDependencies.nodes[node.id])
    }

    // Find invalid connections
    if (state.pageDataDependencies.connections[node.internal.type]) {
      dirtyPaths = dirtyPaths.concat(
        state.pageDataDependencies.connections[node.internal.type]
      )
    }
  })

  if (dirtyPaths.length > 0) {
    // Run these pages
    return Promise.all(
      _.uniq(dirtyPaths).map(path => {
        const page = state.pages.find(p => p.path === path)
        const component = state.pageComponents[page.component]
        return queryRunner(page, component)
      })
    )
  } else {
    return Promise.resolve()
  }
}

const debouncedProcessQueries = _.debounce(() => {
  if (active) {
    queuedDirtyActions = _.uniq(queuedDirtyActions, a => a.payload.id)
    findAndRunQueriesForDirtyPaths(queuedDirtyActions)
    queuedDirtyActions = []
  }
}, 25)
