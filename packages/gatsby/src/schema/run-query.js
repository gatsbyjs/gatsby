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

/**
 * Runs the query over all nodes of type. It must first select the
 * appropriate query engine. Sift, or Loki. Sift is used if the query
 * includes plugin fields, i.e those declared by plugins during the
 * `setFieldsOnGraphQLNodeType` API. If it does, then we must iterate
 * through all nodes calling the plugin field to make sure it's
 * realized, then we can perform the query. See `query-sift.js` for
 * more.
 *
 * If the query does *not* include plugin fields, then we can perform
 * a much faster pure data query using loki. See `query-loki.js` for
 * more.
 *
 * @param {Object} args. Object with:
 *
 * {Object} gqlType: built during `./build-node-types.js`
 *
 * {Object} rawGqlArgs: The raw graphql query as a js object. E.g `{
 * filter: { fields { slug: { eq: "/somepath" } } } }`
 *
 * {Object} context: The context from the QueryJob
 *
 * {boolean} firstOnly: Whether to return the first found match, or
 * all matching result.
 *
 * @returns {promise} A promise that will eventually be resolved with
 * a collection of matching objects (even if `firstOnly` is true)
 */
function runQuery(args) {
  const { queryArgs, ...restArgs } = args

  const queryFunction = chooseQueryEngine(queryArgs)

  return queryFunction({ rawGqlArgs: queryArgs, ...restArgs })
}

module.exports.runQuery = runQuery
