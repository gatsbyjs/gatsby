const _ = require(`lodash`)
const queryLoki = require(`./query-loki`)
const querySift = require(`./query-sift`)
const { pluginFieldTracking } = require(`./plugin-fields`)

function hasPluginFields(queryArgs) {
  return _.some(queryArgs.filter, (v, fieldName) =>
    pluginFieldTracking.has(fieldName)
  )
}

function chooseQueryEngine(queryArgs) {
  if (hasPluginFields(queryArgs)) {
    return querySift.runQuery
  } else {
    return queryLoki.runQuery
  }
}

// Selects the appropriate query engine and executes the query. The
// two query engines are sift and loki. Sift is used if the query
// includes plugin fields, i.e those declared by plugins during the
// `setFieldsOnGraphQLNodeType` API. If it does, then we must iterate
// through all nodes calling the plugin field to make sure it's
// realized, then we can perform the query. See `query-sift.js` for
// more.
//
// If the query does *not* include plugin fields, then we can perform
// a much faster pure data query using loki. See `query-loki.js` for
// more.
//
// In both cases, a promise is returned that will eventually have the
// query results (as an array, even if the query was for a connection)
function runQuery(args) {
  const { type, queryArgs, context } = args

  const queryFunction = chooseQueryEngine(queryArgs)

  return queryFunction({ rawGqlArgs: queryArgs, type, context })
}

module.exports.runQuery = runQuery
