const _ = require(`lodash`)
const { connectionFromArray } = require(`graphql-skip-limit`)
const { createPageDependency } = require(`../redux/actions/add-page-dependency`)
const queryLoki = require(`../query-loki`)
const querySift = require(`../query-sift`)
const { pluginFieldTracking } = require(`../redux`)

function hasPluginFields(queryArgs) {
  return _.some(queryArgs.filter, (v, fieldName) =>
    pluginFieldTracking.has(fieldName)
  )
}

function chooseQueryFunction(args) {
  if (hasPluginFields(args.queryArgs)) {
    return querySift
  } else {
    return queryLoki
  }
}

function handleSingle({ results, queryArgs, path }) {
  if (results.length > 0) {
    const nodeId = results[0].id
    createPageDependency({ path, nodeId })
    return results
  } else {
    return null
  }
}

function handleConnection({ results, queryArgs, path }) {
  if (results && results.length) {
    const connection = connectionFromArray(results, queryArgs)
    connection.totalCount = results.length

    if (results.length > 0 && results[0].internal) {
      const connectionType = connection.edges[0].node.internal.type
      createPageDependency({
        path,
        connection: connectionType,
      })
    }
    return connection
  } else {
    return null
  }
}

async function runResolver(args) {
  const { type, queryArgs, isConnection, path } = args

  const queryFunction = chooseQueryFunction(args)

  queryArgs = !isConnection ? { filter: queryArgs } : queryArgs
  const results = await queryFunction({ rawGqlArgs: queryArgs, ...args })

  if (isConnection) {
    return handleConnection({ results, ...args })
  } else {
    return handleSingle({ results, ...args })
  }
}
