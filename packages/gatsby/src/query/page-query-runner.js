// @flow

import type { QueryJob } from "../query-runner"
const _ = require(`lodash`)
const Queue = require(`better-queue`)
const convertHrtime = require(`convert-hrtime`)
const { store, emitter } = require(`../redux`)
const queryQueue = require(`./queue`)

let seenIdsWithoutDataDependencies = []
let queuedDirtyActions = []
const extractedQueryIds = new Set()

// Remove pages from seenIdsWithoutDataDependencies when they're deleted
// so their query will be run again if they're created again.
emitter.on(`DELETE_PAGE`, action => {
  seenIdsWithoutDataDependencies = seenIdsWithoutDataDependencies.filter(
    p => p !== action.payload.path
  )
})

emitter.on(`CREATE_NODE`, action => {
  queuedDirtyActions.push(action)
})

emitter.on(`DELETE_NODE`, action => {
  queuedDirtyActions.push({ payload: action.payload })
})

const enqueueExtractedQueryId = pathname => {
  extractedQueryIds.add(pathname)
}

/////////////////////////////////////////////////////////////////////
// Calculate dirty static/page queries

const popExtractedQueries = () => {
  const queries = [...extractedQueryIds]
  extractedQueryIds.clear()
  return queries
}

const findIdsWithoutDataDependencies = state => {
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

const popNodeQueries = state => {
  const actions = _.uniq(queuedDirtyActions, a => a.payload.id)
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
  queuedDirtyActions = []
  return uniqDirties
}

const popNodeAndDepQueries = state => {
  const nodeQueries = popNodeQueries(state)

  const noDepQueries = findIdsWithoutDataDependencies(state)

  return _.uniq([...nodeQueries, ...noDepQueries])
}

/**
 * Calculates the set of dirty query IDs (page.paths, or
 * staticQuery.hash's). These are queries that:
 *
 * - depend on nodes or node collections (via
 *   `actions.createPageDependency`) that have changed.
 * - do NOT have node dependencies. Since all queries should return
 *   data, then this implies that node dependencies have not been
 *   tracked, and therefore these queries haven't been run before
 * - have been recently extracted (see `./query-watcher.js`)
 *
 * Note, this function pops queries off internal queues, so it's up
 * to the caller to reference the results
 */

const calcDirtyQueryIds = state =>
  _.union(popNodeAndDepQueries(state), popExtractedQueries())

/**
 * Same as `calcDirtyQueryIds`, except that we only include extracted
 * queries that depend on nodes or haven't been run yet. We do this
 * because the page component reducer/machine always enqueues
 * extractedQueryIds but during bootstrap we may not want to run those
 * page queries if their data hasn't changed since the last time we
 * ran Gatsby.
 */
const calcInitialDirtyQueryIds = state => {
  const nodeAndNoDepQueries = popNodeAndDepQueries(state)

  const extractedQueriesThatNeedRunning = _.intersection(
    popExtractedQueries(),
    nodeAndNoDepQueries
  )
  return _.union(extractedQueriesThatNeedRunning, nodeAndNoDepQueries)
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

const runInitialQueries = async activity => {
  const pathnamesToRun = calcInitialDirtyQueryIds(store.getState())
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
    listenerQueue.push(makeQueryJobs(calcDirtyQueryIds(store.getState())))
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
