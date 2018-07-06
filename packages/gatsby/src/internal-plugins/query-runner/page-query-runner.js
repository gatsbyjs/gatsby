// @flow

import type { QueryJob } from "../query-runner"

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
  let start = process.hrtime()
  queuedDirtyActions = _.uniq(queuedDirtyActions, a => a.payload.id)
  global._PROFILE({ start, name: `uniq queuedDirtyActions` })
  const dirtyIds = findDirtyIds(queuedDirtyActions)
  await runQueriesForPathnames(dirtyIds)

  queuedDirtyActions = []

  // Find ids without data dependencies (i.e. no queries have been run for
  // them before) and run them.
  const cleanIds = findIdsWithoutDataDependencies()

  // Run these pages
  await runQueriesForPathnames(cleanIds)

  active = true
  return
}

emitter.on(`CREATE_NODE`, action => {
  queuedDirtyActions.push(action)
})

emitter.on(`DELETE_NODE`, action => {
  queuedDirtyActions.push({ payload: action.payload })
})

const runQueuedActions = async () => {
  if (active) {
    queuedDirtyActions = _.uniq(queuedDirtyActions, a => a.payload.id)
    await runQueriesForPathnames(findDirtyIds(queuedDirtyActions))
    queuedDirtyActions = []

    // Find ids without data dependencies (e.g. new pages) and run
    // their queries.
    const cleanIds = findIdsWithoutDataDependencies()
    runQueriesForPathnames(cleanIds)
  }
}

// Wait until all plugins have finished running (e.g. various
// transformer plugins) before running queries so we don't
// query things in a 1/2 finished state.
emitter.on(`API_RUNNING_QUEUE_EMPTY`, runQueuedActions)

let seenIdsWithoutDataDependencies = []
const findIdsWithoutDataDependencies = () => {
  const start = process.hrtime()
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
      ...Array.from(state.pages.values(), p => p.path),
      ...[...state.staticQueryComponents.values()].map(c => c.jsonName),
    ],
    [...allTrackedIds, ...seenIdsWithoutDataDependencies]
  )

  // Add new IDs to our seen array so we don't keep trying to run queries for them.
  // Pages without queries can't be tracked.
  seenIdsWithoutDataDependencies = _.uniq([
    ...notTrackedIds,
    ...seenIdsWithoutDataDependencies,
  ])

  global._PROFILE({ start, name: `findIdsWithoutDataDependencies` })
  return notTrackedIds
}

const runQueriesForPathnames = pathnames => {
  const start = process.hrtime()
  const blah = process.hrtime()
  const staticQueries = pathnames.filter(p => p.slice(0, 4) === `sq--`)
  const pageQueries = pathnames.filter(p => p.slice(0, 4) !== `sq--`)
  const state = store.getState()
  global._PROFILE({ start: blah, name: `filter paths for running` })

  staticQueries.forEach(id => {
    const start2 = process.hrtime()
    const staticQueryComponent = store.getState().staticQueryComponents.get(id)
    const queryJob: QueryJob = {
      id: staticQueryComponent.hash,
      hash: staticQueryComponent.hash,
      jsonName: staticQueryComponent.jsonName,
      query: staticQueryComponent.query,
      componentPath: staticQueryComponent.componentPath,
      context: { path: staticQueryComponent.jsonName },
    }
    queue.push(queryJob)
    global._PROFILE({ start: start2, name: `queue static query` })
  })

  const start3 = process.hrtime()
  const pages = state.pages
  let didNotQueueItems = true
  pageQueries.forEach(id => {
    const page = pages.get(id)
    if (page) {
      didNotQueueItems = false
      queue.push(
        ({
          id: page.path,
          jsonName: page.jsonName,
          query: store.getState().components[page.componentPath].query,
          isPage: true,
          componentPath: page.componentPath,
          context: {
            ...page,
            ...page.context,
          },
        }: QueryJob)
      )
    }
  })
  global._PROFILE({ start: start3, name: `queue page queries` })

  if (didNotQueueItems || !pathnames || pathnames.length === 0) {
    return Promise.resolve()
  }

  return new Promise(resolve => {
    queue.on(`drain`, () => {
      global._PROFILE({ start, name: `runQueriesForPathnames` })
      resolve()
    })
  })
}

const findDirtyIds = actions => {
  const start = process.hrtime()
  const state = store.getState()
  const uniqDirties = _.uniq(
    actions.reduce((dirtyIds, action) => {
      const node = action.payload

      if (!node || !node.id || !node.internal.type) return dirtyIds

      // Find components that depend on this node so are now dirty.
      dirtyIds = dirtyIds.concat(state.componentDataDependencies.nodes[node.id])

      // Find connections that depend on this node so are now invalid.
      dirtyIds = dirtyIds.concat(
        state.componentDataDependencies.connections[node.internal.type]
      )

      return _.compact(dirtyIds)
    }, [])
  )
  global._PROFILE({ start, name: `findDirtyIds` })
  return uniqDirties
}
