const _ = require(`lodash`)
const fastq = require(`fastq`)
const { store } = require(`../redux`)
const { hasFlag, FLAG_ERROR_EXTRACTION } = require(`../redux/reducers/queries`)
const { queryRunner } = require(`./query-runner`)
const { websocketManager } = require(`../utils/websocket-manager`)
const { GraphQLRunner } = require(`./graphql-runner`)

if (process.env.GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY) {
  console.info(
    `GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY: Running with concurrency set to \`${process.env.GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY}\``
  )
}

const concurrency =
  Number(process.env.GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY) || 4

/**
 * Calculates the set of dirty query IDs (page.paths, or staticQuery.id's).
 *
 * Dirty state is tracked in `queries` reducer, here we simply filter
 * them from all tracked queries.
 */
function calcDirtyQueryIds(state) {
  const { trackedQueries, trackedComponents, deletedQueries } = state.queries

  const queriesWithBabelErrors = new Set()
  for (const component of trackedComponents.values()) {
    if (hasFlag(component.errors, FLAG_ERROR_EXTRACTION)) {
      for (const queryId of component.pages) {
        queriesWithBabelErrors.add(queryId)
      }
    }
  }
  // Note: trackedQueries contains both - page and static query ids
  const dirtyQueryIds = []
  for (const [queryId, query] of trackedQueries) {
    if (deletedQueries.has(queryId)) {
      continue
    }
    if (query.dirty > 0 && !queriesWithBabelErrors.has(queryId)) {
      dirtyQueryIds.push(queryId)
    }
  }
  return dirtyQueryIds
}

/**
 * groups queryIds by whether they are static or page queries.
 */
function groupQueryIds(queryIds) {
  const grouped = _.groupBy(queryIds, p =>
    p.slice(0, 4) === `sq--` ? `static` : `page`
  )
  const { pages } = store.getState()
  return {
    staticQueryIds: grouped.static || [],
    pageQueryIds:
      grouped.page.map(pagePath => pages.get(pagePath)).filter(Boolean) || [],
  }
}

function createQueue({
  createJobFn,
  state,
  activity,
  graphqlRunner,
  graphqlTracing,
}) {
  if (!graphqlRunner) {
    graphqlRunner = new GraphQLRunner(store, { graphqlTracing })
  }
  state = state || store.getState()

  function worker(queryId, cb) {
    const job = createJobFn(state, queryId)
    if (!job) {
      cb(null, undefined)
      return
    }
    queryRunner(graphqlRunner, job, activity?.span)
      .then(result => {
        if (activity.tick) {
          activity.tick()
        }
        cb(null, { job, result })
      })
      .catch(error => {
        cb(error)
      })
  }
  // Note: fastq.promise version is much slower
  return fastq(worker, concurrency)
}

async function processQueries({
  queryIds,
  createJobFn,
  onQueryDone,
  state,
  activity,
  graphqlRunner,
  graphqlTracing,
}) {
  return new Promise((resolve, reject) => {
    const fastQueue = createQueue({
      createJobFn,
      state,
      activity,
      graphqlRunner,
      graphqlTracing,
    })

    queryIds.forEach(queryId => {
      fastQueue.push(queryId, (err, res) => {
        if (err) {
          fastQueue.kill()
          reject(err)
          return
        }
        if (res && onQueryDone) {
          onQueryDone(res)
        }
      })
    })

    if (!fastQueue.idle()) {
      fastQueue.drain = () => resolve()
    } else {
      resolve()
    }
  })
}

function createStaticQueryJob(state, queryId) {
  const component = state.staticQueryComponents.get(queryId)
  if (!component) {
    return undefined
  }
  const { hash, id, query, componentPath } = component
  return {
    id: queryId,
    hash,
    query,
    componentPath,
    context: { path: id },
  }
}

function onDevelopStaticQueryDone({ job, result }) {
  websocketManager.emitStaticQueryData({
    result,
    id: job.hash,
  })
}

async function processStaticQueries(
  queryIds,
  { state, activity, graphqlRunner, graphqlTracing }
) {
  return processQueries({
    queryIds,
    createJobFn: createStaticQueryJob,
    onQueryDone:
      process.env.NODE_ENV === `production`
        ? undefined
        : onDevelopStaticQueryDone,
    state,
    activity,
    graphqlRunner,
    graphqlTracing,
  })
}

async function processPageQueries(
  queryIds,
  { state, activity, graphqlRunner, graphqlTracing }
) {
  return processQueries({
    queryIds,
    createJobFn: createPageQueryJob,
    state,
    activity,
    graphqlRunner,
    graphqlTracing,
  })
}

function createPageQueryJob(state, page) {
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
