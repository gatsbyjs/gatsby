// @flow

import type { QueryJob } from "../query-runner"
const _ = require(`lodash`)
const Queue = require(`better-queue`)
const convertHrtime = require(`convert-hrtime`)
const { store, emitter } = require(`../redux`)
const queryQueue = require(`./queue`)

let queuedDirtyActions = []

const extractedQueryIds = new Set()
const enqueueExtractedQueryId = pathname => {
  extractedQueryIds.add(pathname)
}

const calcQueries = (initial = false) => {
  // Find paths dependent on dirty nodes
  queuedDirtyActions = _.uniq(queuedDirtyActions, a => a.payload.id)
  const dirtyIds = findDirtyIds(queuedDirtyActions)
  queuedDirtyActions = []

  // Find ids without data dependencies (i.e. no queries have been run for
  // them before) and run them.
  const cleanIds = findIdsWithoutDataDependencies()

  // Construct paths for all queries to run
  let pathnamesToRun = _.uniq([...dirtyIds, ...cleanIds])

  // If this is the initial run, remove pathnames from `extractedQueryIds`
  // if they're also not in the dirtyIds or cleanIds.
  //
  // We do this because the page component reducer/machine always
  // adds pages to extractedQueryIds but during bootstrap
  // we may not want to run those page queries if their data hasn't
  // changed since the last time we ran Gatsby.
  let diffedPathnames = [...extractedQueryIds]
  if (initial) {
    diffedPathnames = _.intersection([...extractedQueryIds], pathnamesToRun)
  }

  // Combine.
  pathnamesToRun = _.union(diffedPathnames, pathnamesToRun)

  extractedQueryIds.clear()

  return pathnamesToRun
}

emitter.on(`CREATE_NODE`, action => {
  queuedDirtyActions.push(action)
})

emitter.on(`DELETE_NODE`, action => {
  queuedDirtyActions.push({ payload: action.payload })
})

let seenIdsWithoutDataDependencies = []

// Remove pages from seenIdsWithoutDataDependencies when they're deleted
// so their query will be run again if they're created again.
emitter.on(`DELETE_PAGE`, action => {
  seenIdsWithoutDataDependencies = seenIdsWithoutDataDependencies.filter(
    p => p !== action.payload.path
  )
})

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

  return notTrackedIds
}

const makeQueryJobs = pathnames => {
  const staticQueries = pathnames.filter(p => p.slice(0, 4) === `sq--`)
  const pageQueries = pathnames.filter(p => p.slice(0, 4) !== `sq--`)
  const state = store.getState()
  const queryJobs = []

  staticQueries.forEach(id => {
    const staticQueryComponent = store.getState().staticQueryComponents.get(id)
    const queryJob: QueryJob = {
      id: staticQueryComponent.hash,
      hash: staticQueryComponent.hash,
      jsonName: staticQueryComponent.jsonName,
      query: staticQueryComponent.query,
      componentPath: staticQueryComponent.componentPath,
      context: { path: staticQueryComponent.jsonName },
    }
    queryJobs.push(queryJob)
  })

  const pages = state.pages
  pageQueries.forEach(id => {
    const page = pages.get(id)
    if (page) {
      queryJobs.push(
        ({
          id: page.path,
          jsonName: page.jsonName,
          query: store.getState().components.get(page.componentPath).query,
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
  return queryJobs
}

const findDirtyIds = actions => {
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
  return uniqDirties
}

const runInitialQueries = async activity => {
  const pathnamesToRun = calcQueries(true)
  if (pathnamesToRun.length === 0) {
    return
  }

  const queryJobs = makeQueryJobs(pathnamesToRun)

  const queue = queryQueue.makeBuild()

  const startQueries = process.hrtime()
  queue.on(`task_finish`, () => {
    const stats = queue.getStats()
    activity.setStatus(
      `${stats.total}/${stats.peak} ${(
        stats.total / convertHrtime(process.hrtime(startQueries)).seconds
      ).toFixed(2)} queries/second`
    )
  })
  await queryQueue.processBatch(queue, queryJobs)
}

/////////////////////////////////////////////////////////////////////
// Listener for gatsby develop

// Initialized via `startListening`
let listenerQueue

/**
 * Run any dirty queries. See `calcQueries` for what constitutes a
 * dirty query
 */
const runQueuedQueries = () => {
  if (listenerQueue) {
    listenerQueue.push(makeQueryJobs(calcQueries(false)))
  }
}

/**
 * Starts a background process that processes any dirty queries
 * whenever one of the following occurs:
 *
 * 1. A node has changed (but only after the api call has finished
 * running)
 * 2. A component query (e.g by editing a React Component) has
 * changed
 *
 * For what constitutes a dirty query, see `calcQueries`
 */
const startListening = queue => {
  // We use a queue to process batches of queries so that they are
  // processed consecutively
  listenerQueue = new Queue((queryJobs, callback) =>
    queryQueue
      .processBatch(queue, queryJobs)
      .then(() => callback(null))
      .catch(callback)
  )

  emitter.on(`API_RUNNING_QUEUE_EMPTY`, runQueuedQueries)
}

module.exports = {
  runInitialQueries,
  startListening,
  runQueuedQueries,
  enqueueExtractedQueryId,
}
