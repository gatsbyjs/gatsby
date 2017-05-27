/** *
 * Jobs of this module
 * - Ensure on bootstrap that all invalid page queries are run and report
 *   when this is done
 * - Watch for when a page's query is invalidated and re-run it.
 ***/

const _ = require(`lodash`)
const Promise = require(`bluebird`)

const { store, emitter } = require(`../redux`)
const queryRunner = require(`./query-runner`)
const checkpointsPromise = require(`../utils/checkpoints-promise`)

let queuedDirtyActions = []
// Don't start running queries until we've reached the BOOTSTRAP_STAGE of
// QUERY_RUNNER.
let active = false
const callbacks = []
module.exports = cb => {
  callbacks.push(cb)
}

checkpointsPromise({
  events: [`COMPONENT_QUERIES_EXTRACTION_FINISHED`],
}).then(() => {
  active = true
  const state = store.getState()

  // Run queued dirty nodes now that we're active.
  queuedDirtyActions = _.uniq(queuedDirtyActions, a => a.payload.id)
  findAndRunQueriesForDirtyPaths(queuedDirtyActions).then(() => {
    // Find paths without data dependencies and run them (just in case?)
    const paths = findPathsWithoutDataDependencies()
    // Run these pages
    Promise.all(
      paths.map(path => {
        const page = state.pages.find(p => p.path === path)
        const component = state.pageComponents[page.component]
        return queryRunner(page, component)
      })
    ).then(() => {
      // Tell everyone who cares that we're done.
      callbacks.forEach(cb => cb())
    })
  })
})

emitter.on(`CREATE_NODE`, action => {
  queuedDirtyActions.push(action)
  debouncedProcessQueries()
})

emitter.on(`UPDATE_NODE`, () => {
  // Also debounce on UPDATE_NODE so we're sure all node processing is done
  // before re-running a query.
  //
  // PS. prediction to future selves, this method of debouncing data processing
  // will break down bigly once data processing pipelines get really complex or
  // plugins introduce very expensive steps.
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
