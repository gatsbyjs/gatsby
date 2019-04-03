// @flow

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

/**
 * groups queryIds by whether they are static or page queries.
 */
const groupQueryIds = queryIds => {
  const grouped = _.groupBy(queryIds, p => p.slice(0, 4) === `sq--`)
  return {
    staticQueryIds: grouped[true] || [],
    pageQueryIds: grouped[false] || [],
  }
}

const reportStats = (queue, activity) => {
  const startQueries = process.hrtime()
  queue.on(`task_finish`, () => {
    const stats = queue.getStats()
    activity.setStatus(
      `${stats.total}/${stats.peak} ${(
        stats.total / convertHrtime(process.hrtime(startQueries)).seconds
      ).toFixed(2)} queries/second`
    )
  })
}

const processQueries = async (queryJobs, activity) => {
  const queue = queryQueue.makeBuild()
  reportStats(queue, activity)
  await queryQueue.processBatch(queue, queryJobs)
}

const makeStaticQueryJob = (state, queryId) => {
  const component = state.staticQueryComponents.get(queryId)
  const { hash, jsonName, query, componentPath } = component
  return {
    id: hash,
    hash,
    jsonName,
    query,
    componentPath,
    context: { path: jsonName },
  }
}

const processStaticQueries = async (queryIds, { state, activity }) => {
  state = state || store.getState()
  await processQueries(
    queryIds.map(id => makeStaticQueryJob(state, id)),
    activity
  )
}

const makePageQueryJob = (state, queryId) => {
  const page = state.pages.get(queryId)
  const component = state.components.get(page.componentPath)
  const { path, jsonName, componentPath, context } = page
  const { query } = component
  return {
    id: path,
    jsonName,
    query,
    isPage: true,
    componentPath,
    context: {
      ...page,
      ...context,
    },
  }
}

const processPageQueries = async (queryIds, { state, activity }) => {
  state = state || store.getState()
  await processQueries(
    queryIds.map(id => makePageQueryJob(state, id)),
    activity
  )
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
    const state = store.getState()
    const { staticQueryIds, pageQueryIds } = groupQueryIds(
      calcDirtyQueryIds(state)
    )
    const queryJobs = [
      ...staticQueryIds.map(id => makeStaticQueryJob(state, id)),
      ...pageQueryIds.map(id => makePageQueryJob(state, id)),
    ]
    listenerQueue.push(queryJobs)
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
  calcInitialDirtyQueryIds,
  groupQueryIds,
  processStaticQueries,
  processPageQueries,
  startListening,
  runQueuedQueries,
  enqueueExtractedQueryId,
}
