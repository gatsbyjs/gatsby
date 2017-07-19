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

  // console.log(queuedDirtyActions)
  await findAndRunQueriesForDirtyPaths(queuedDirtyActions)

  // Find paths without data dependencies and run them (just in case?)
  const paths = findPathsWithoutDataDependencies()
  // Run these pages
  await Promise.all(
    paths.map(id => {
      const items = [
        ...state.pages,
        ...state.layouts
      ]
      const item = items.find(item => item.path === id || item.id === id)
      const component = state.components[item.component]
      return queryRunner(item, component)
    })
  )
  return
}

emitter.on(`CREATE_NODE`, action => {
  queuedDirtyActions.push(action)
})

const runQueuedActions = () => {
  if (active) {
    queuedDirtyActions = _.uniq(queuedDirtyActions, a => a.payload.id)
    findAndRunQueriesForDirtyPaths(queuedDirtyActions)
    queuedDirtyActions = []
  }
}

// Wait until all plugins have finished running (e.g. various
// transformer plugins) before running queries so we don't
// query things in a 1/2 finished state.
emitter.on(`API_RUNNING_QUEUE_EMPTY`, runQueuedActions)

const findPathsWithoutDataDependencies = () => {
  const state = store.getState()
  const allTrackedPaths = _.uniq(
    _.flatten(
      _.concat(
        _.values(state.componentDataDependencies.nodes),
        _.values(state.componentDataDependencies.connections)
      )
    )
  )

  // Get list of paths not already tracked and run the queries for these
  // paths.
  return _.difference([
    ...state.pages.map(p => p.path),
    ...state.layouts.map(l => l.id)
  ], allTrackedPaths)
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
    if (state.componentDataDependencies.nodes[node.id]) {
      dirtyPaths = dirtyPaths.concat(state.componentDataDependencies.nodes[node.id])
    }

    // Find invalid connections
    if (state.componentDataDependencies.connections[node.internal.type]) {
      dirtyPaths = dirtyPaths.concat(
        state.componentDataDependencies.connections[node.internal.type]
      )
    }
  })

  if (dirtyPaths.length > 0) {
    console.log(dirtyPaths)
    // Run these pages
    return Promise.all(
      _.uniq(dirtyPaths).map(id => {
        const items = [
          ...state.pages,
          ...state.layouts
        ]
        const item = items.find(p => p.path === id || p.id === id)
        if (item) {
          const component = state.components[item.component]
          return queryRunner(item, component)
        }
      })
    )
  } else {
    return Promise.resolve()
  }
}
