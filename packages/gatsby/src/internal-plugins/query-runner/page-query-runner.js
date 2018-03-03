/**
 * Jobs of this module
 * - Ensure on bootstrap that all invalid page queries are run and report
 *   when this is done
 * - Watch for when a page's query is invalidated and re-run it.
 */

const _ = require(`lodash`)

const queue = require(`./query-queue`)
const { store, emitter } = require(`../../redux`)

let queuedDirtyActions = []
let active = false

// Do initial run of graphql queries during bootstrap.
// Afterwards we listen "API_RUNNING_QUEUE_EMPTY" and check
// for dirty nodes before running queries.
exports.runQueries = async () => {
  // Run queued dirty nodes now that we're active.
  queuedDirtyActions = _.uniq(queuedDirtyActions, a => a.payload.id)
  const dirtyIds = findDirtyIds(queuedDirtyActions)
  await runQueriesForIds(dirtyIds)

  queuedDirtyActions = []

  // Find ids without data dependencies (i.e. no queries have been run for
  // them before) and run them.
  const cleanIds = findIdsWithoutDataDependencies()

  // Run these pages
  await runQueriesForIds(cleanIds)

  active = true
  return
}

emitter.on(`CREATE_NODE`, action => {
  queuedDirtyActions.push(action)
})

emitter.on(`DELETE_NODE`, action => {
  queuedDirtyActions.push({ payload: action.node })
})

const runQueuedActions = async () => {
  if (active) {
    queuedDirtyActions = _.uniq(queuedDirtyActions, a => a.payload.id)
    await runQueriesForIds(findDirtyIds(queuedDirtyActions))
    queuedDirtyActions = []

    // Find ids without data dependencies (e.g. new pages) and run
    // their queries.
    const cleanIds = findIdsWithoutDataDependencies()
    runQueriesForIds(cleanIds)
  }
}

// Wait until all plugins have finished running (e.g. various
// transformer plugins) before running queries so we don't
// query things in a 1/2 finished state.
emitter.on(`API_RUNNING_QUEUE_EMPTY`, runQueuedActions)

let seenIdsWithoutDataDependencies = []
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
  const notTrackedIds = _.difference(
    [
      ...state.pages.map(p => p.path),
      ...state.layouts.map(l => `LAYOUT___${l.id}`),
    ],
    [...allTrackedIds, ...seenIdsWithoutDataDependencies]
  )

  // Add new IDs to our seen array so we don't keep trying to run queries for them.
  // Pages/Layouts without queries can't be tracked.
  seenIdsWithoutDataDependencies = _.uniq([
    ...notTrackedIds,
    ...seenIdsWithoutDataDependencies,
  ])

  return notTrackedIds
}

const runQueriesForIds = ids => {
  const state = store.getState()
  const pagesAndLayouts = [...state.pages, ...state.layouts]
  let didNotQueueItems = true
  ids.forEach(id => {
    const plObj = pagesAndLayouts.find(
      pl => pl.path === id || `LAYOUT___${pl.id}` === id
    )
    if (plObj) {
      didNotQueueItems = false
      queue.push({ ...plObj, _id: plObj.id, id: plObj.jsonName })
    }
  })

  if (didNotQueueItems || !ids || ids.length === 0) {
    return Promise.resolve()
  }

  return new Promise(resolve => {
    queue.on(`drain`, () => {
      resolve()
    })
  })
}

const findDirtyIds = actions => {
  const state = store.getState()
  return _.uniq(
    actions.reduce((dirtyIds, action) => {
      const node = action.payload

      if (!node || !node.id || !node.internal.type) return dirtyIds

      // Find pagesAndLayouts that depend on this node so are now dirty.
      dirtyIds = dirtyIds.concat(state.componentDataDependencies.nodes[node.id])

      // Find connections that depend on this node so are now invalid.
      dirtyIds = dirtyIds.concat(
        state.componentDataDependencies.connections[node.internal.type]
      )

      return _.compact(dirtyIds)
    }, [])
  )
}
