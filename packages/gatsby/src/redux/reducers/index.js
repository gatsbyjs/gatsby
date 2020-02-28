const reduxNodes = require(`./nodes`)
const lokiNodes = require(`../../db/loki/nodes`).reducer
let sqliteNodes

const backend = process.env.GATSBY_DB_NODES || `redux`

function getNodesReducer() {
  let nodesReducer
  switch (backend) {
    case `redux`:
      nodesReducer = reduxNodes
      break
    case `loki`:
      nodesReducer = sqliteNodes
      break
    case `sqlite`:
      nodesReducer =
        sqliteNodes || (sqliteNodes = require(`../../db/sqlite/nodes`).reducer)
      break
    default:
      throw new Error(
        `Unsupported DB reducer backend (value of env var GATSBY_DB_NODES: ${backend})`
      )
  }
  return nodesReducer
}

function getNodesByTypeReducer() {
  let nodesReducer
  switch (backend) {
    case `redux`:
      nodesReducer = require(`./nodes-by-type`)
      break
    case `loki`:
      nodesReducer = (state = null) => null
      break
    case `sqlite`:
      nodesReducer = (state = null) => null
      break
    default:
      throw new Error(
        `Unsupported DB type reducer backend (value of env var GATSBY_DB_NODES: ${backend})`
      )
  }
  return nodesReducer
}

/**
 * @property exports.nodesTouched Set<string>
 */
module.exports = {
  program: require(`./program`),
  nodes: getNodesReducer(),
  nodesByType: getNodesByTypeReducer(),
  resolvedNodesCache: require(`./resolved-nodes`),
  nodesTouched: require(`./nodes-touched`),
  lastAction: require(`./last-action`),
  flattenedPlugins: require(`./flattened-plugins`),
  config: require(`./config`),
  pages: require(`./pages`),
  schema: require(`./schema`),
  status: require(`./status`),
  componentDataDependencies: require(`./component-data-dependencies`),
  components: require(`./components`),
  staticQueryComponents: require(`./static-query-components`),
  jobs: require(`./jobs`),
  jobsV2: require(`./jobsv2`),
  webpack: require(`./webpack`),
  webpackCompilationHash: require(`./webpack-compilation-hash`),
  redirects: require(`./redirects`),
  babelrc: require(`./babelrc`),
  schemaCustomization: require(`./schema-customization`),
  themes: require(`./themes`),
  logs: require(`gatsby-cli/lib/reporter/redux/reducer`),
  inferenceMetadata: require(`./inference-metadata`),
  pageDataStats: require(`./page-data-stats`),
  pageData: require(`./page-data`),
}
