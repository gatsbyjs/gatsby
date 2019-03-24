const _ = require(`lodash`)
const { store, emitter } = require(`../../redux`)
const queryQueue = require(`./query-queue`)
const convertHrtime = require(`convert-hrtime`)
require(`./pages-writer`)

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

const enqueueExtractedQueryId = queryId => {
  extractedQueryIds.add(queryId)
}

/////////////////////////////////////////////////////////////////////
// Calculate dirty static/page queries

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

const popNodeQueries = ({ state }) => {
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
  const nodeQueries = popNodeQueries({ state })

  const noDepQueries = findIdsWithoutDataDependencies(state)

  return _.uniq([...nodeQueries, ...noDepQueries])
}

const popExtractedQueries = () => {
  const queries = [...extractedQueryIds]
  extractedQueryIds.clear()
  return queries
}

const calcDirtyQueryIds = state =>
  _.union(popNodeAndDepQueries(state), popExtractedQueries())

const calcBootstrapDirtyQueryIds = state => {
  const nodeAndNoDepQueries = popNodeAndDepQueries(state)

  const extractedQueriesThatNeedRunning = _.intersection(
    popExtractedQueries(),
    nodeAndNoDepQueries
  )
  return _.union(extractedQueriesThatNeedRunning, nodeAndNoDepQueries)
}

const categorizeQueryIds = queryIds => {
  const grouped = _.groupBy(queryIds, p => p.slice(0, 4) === `sq--`)
  return {
    staticQueryIds: grouped[true] || [],
    pageQueryIds: grouped[false] || [],
  }
}

/////////////////////////////////////////////////////////////////////
// Create Query Jobs

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

const makePageQueryJob = (state, queryId) => {
  const page = state.pages.get(queryId)
  const component = state.components.get(page.componentPath)
  const { path, jsonName, componentPath, context } = page
  const { query } = component
  return {
    id: path,
    jsonName: jsonName,
    query,
    isPage: true,
    componentPath,
    context: {
      ...page,
      ...context,
    },
  }
}

const processQueries = async (queryJobs, { activity }) => {
  if (queryJobs.length == 0) {
    return
  }
  const startQueries = process.hrtime()

  const queue = queryQueue.create()
  queue.on(`task_finish`, () => {
    const stats = queue.getStats()
    activity.setStatus(
      `${stats.total}/${stats.peak} ${(
        stats.total / convertHrtime(process.hrtime(startQueries)).seconds
      ).toFixed(2)} queries/second`
    )
  })
  const drainedPromise = new Promise(resolve => {
    queue.once(`drain`, resolve)
  })

  queryJobs.forEach(queryJob => {
    queue.push(queryJob)
  })
  await drainedPromise
}

/////////////////////////////////////////////////////////////////////
// Background query daemon (for gatsby develop)

const startDaemon = () => {
  const queue = queryQueue.create()

  const runQueuedActions = () => {
    const state = store.getState()

    const dirtyQueryIds = calcDirtyQueryIds(state)
    const { staticQueryIds, pageQueryIds } = categorizeQueryIds(dirtyQueryIds)

    staticQueryIds
      .map(id => makeStaticQueryJob(state, id))
      .forEach(queryJob => {
        queue.push(queryJob)
      })

    pageQueryIds
      .map(id => makePageQueryJob(state, id))
      .forEach(queryJob => {
        queue.push(queryJob)
      })
  }
  runQueuedActions()
  emitter.on(`API_RUNNING_QUEUE_EMPTY`, runQueuedActions)
  emitter.on(`QUERY_RUNNER_QUERIES_ENQUEUED`, runQueuedActions)
}

const runQueries = () => {
  // emitter will be ignored until `startDaemon` has been invoked
  // (during `gatsby develop`)
  emitter.emit(`QUERY_RUNNER_QUERIES_ENQUEUED`)
}

module.exports = {
  enqueueExtractedQueryId,
  calcBootstrapDirtyQueryIds,
  categorizeQueryIds,
  makeStaticQueryJob,
  makePageQueryJob,
  processQueries,
  runQueries,
  startDaemon,
}
