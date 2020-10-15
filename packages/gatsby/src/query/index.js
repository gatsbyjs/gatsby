const _ = require(`lodash`)
const { store } = require(`../redux`)
const queryQueue = require(`./queue`)

/**
 * Calculates the set of dirty query IDs (page.paths, or staticQuery.id's).
 *
 * Dirty state is tracked in `queries` reducer, here we simply filter
 * them from all tracked queries.
 */
const calcDirtyQueryIds = state => {
  const newDirtyQueryIds = []
  state.queries.trackedQueries.forEach((query, queryId) => {
    if (query.dirty !== 0) {
      newDirtyQueryIds.push(queryId)
    }
  })
  return newDirtyQueryIds
}

/**
 * groups queryIds by whether they are static or page queries.
 */
const groupQueryIds = queryIds => {
  const grouped = _.groupBy(queryIds, p =>
    p.slice(0, 4) === `sq--` ? `static` : `page`
  )
  return {
    staticQueryIds: grouped.static || [],
    pageQueryIds: grouped.page || [],
  }
}

const processQueries = async (
  queryJobs,
  { activity, graphqlRunner, graphqlTracing }
) => {
  const queue = queryQueue.createAppropriateQueue(graphqlRunner, {
    graphqlTracing,
  })
  return queryQueue.processBatch(queue, queryJobs, activity)
}

const createStaticQueryJob = (state, queryId) => {
  const component = state.staticQueryComponents.get(queryId)
  const { hash, id, query, componentPath } = component
  return {
    id: queryId,
    hash,
    query,
    componentPath,
    context: { path: id },
  }
}

const processStaticQueries = async (
  queryIds,
  { state, activity, graphqlRunner, graphqlTracing }
) => {
  state = state || store.getState()
  await processQueries(
    queryIds.map(id => createStaticQueryJob(state, id)),
    {
      activity,
      graphqlRunner,
      graphqlTracing,
    }
  )
}

const processPageQueries = async (
  queryIds,
  { state, activity, graphqlRunner, graphqlTracing }
) => {
  state = state || store.getState()
  // Make sure we filter out pages that don't exist. An example is
  // /dev-404-page/, whose SitePage node is created via
  // `internal-data-bridge`, but the actual page object is only
  // created during `gatsby develop`.
  const pages = _.filter(queryIds.map(id => state.pages.get(id)))
  await processQueries(
    pages.map(page => createPageQueryJob(state, page)),
    {
      activity,
      graphqlRunner,
      graphqlTracing,
    }
  )
}

const createPageQueryJob = (state, page) => {
  const component = state.components.get(page.componentPath)
  const { path, componentPath, context } = page
  const { query } = component
  return {
    id: path,
    query,
    isPage: true,
    componentPath,
    context: {
      ...page,
      ...context,
    },
  }
}

module.exports = {
  calcInitialDirtyQueryIds: calcDirtyQueryIds,
  calcDirtyQueryIds,
  processPageQueries,
  processStaticQueries,
  groupQueryIds,
}
