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
  const dirtyIds = findDirtyIds(queuedDirtyActions)
  await runQueriesForIds(dirtyIds)

  // Find ids without data dependencies and run them (just in case?)
  const cleanIds = findIdsWithoutDataDependencies()
  // Run these pages
  await runQueriesForIds(cleanIds)
  return
}

emitter.on(`CREATE_NODE`, action => {
  queuedDirtyActions.push(action)
})

const runQueuedActions = async () => {
  if (active) {
    queuedDirtyActions = _.uniq(queuedDirtyActions, a => a.payload.id)
    await runQueriesForIds(findDirtyIds(queuedDirtyActions))
    queuedDirtyActions = []
  }
}

// Wait until all plugins have finished running (e.g. various
// transformer plugins) before running queries so we don't
// query things in a 1/2 finished state.
emitter.on(`API_RUNNING_QUEUE_EMPTY`, runQueuedActions)

const findIdsWithoutDataDependencies = () => {
  const state = store.getState()
  const allTrackedIds = _.uniq(
    _.flatten(
      _.concat(
        _.values(state.componentDataDependencies.nodes),
        _.values(state.componentDataDependencies.connections)
      )
    )
  )

  // Get list of paths not already tracked and run the queries for these
  // paths.
  return _.difference(
    [
      ...state.pages.map(p => p.path),
      ...state.layouts.map(l => `LAYOUT___${l.id}`),
    ],
    allTrackedIds
  )
}

const runQueriesForIds = ids => {
  if (ids.length < 1) {
    return Promise.resolve()
  }
  const state = store.getState()
  return Promise.all(
    ids.map(id => {
      const pagesAndLayouts = [...state.pages, ...state.layouts]
      const plObj = pagesAndLayouts.find(
        pl => pl.path === id || `LAYOUT___${pl.id}` === id
      )
      if (plObj) {
        return queryRunner(plObj, state.components[plObj.component])
      }
    })
  )
}

const findDirtyIds = actions => {
  const state = store.getState()
  return actions.reduce((dirtyIds, action) => {
    const node = state.nodes[action.payload.id]
    // Check if the node was deleted
    if (!node) {
      return
    }

    // find invalid pagesAndLayouts
    dirtyIds = dirtyIds.concat(state.componentDataDependencies.nodes[node.id])

    // Find invalid connections
    dirtyIds = dirtyIds.concat(
      state.componentDataDependencies.connections[node.internal.type]
    )

    return _.compact(dirtyIds)
  }, [])
}
