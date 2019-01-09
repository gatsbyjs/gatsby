const reduxNodes = require(`./nodes`)
const lokiNodes = require(`../../db/loki/nodes`).reducer

const backend = process.env.GATSBY_DB_NODES || `redux`

function getNodesReducer() {
  let nodesReducer
  switch (backend) {
    case `redux`:
      nodesReducer = reduxNodes
      break
    case `loki`:
      nodesReducer = lokiNodes
      break
    default:
      throw new Error(
        `Unsupported DB nodes backend (value of env var GATSBY_DB_NODES)`
      )
  }
  return nodesReducer
}

module.exports = {
  program: require(`./program`),
  nodes: getNodesReducer(),
  nodesTouched: require(`./nodes-touched`),
  lastAction: require(`./last-action`),
  plugins: require(`./plugins`),
  flattenedPlugins: require(`./flattened-plugins`),
  apiToPlugins: require(`./api-to-plugins`),
  config: require(`./config`),
  pages: require(`./pages`),
  schema: require(`./schema`),
  status: require(`./status`),
  componentDataDependencies: require(`./component-data-dependencies`),
  components: require(`./components`),
  staticQueryComponents: require(`./static-query-components`),
  jobs: require(`./jobs`),
  webpack: require(`./webpack`),
  redirects: require(`./redirects`),
  babelrc: require(`./babelrc`),
  jsonDataPaths: require(`./json-data-paths`),
  thirdPartySchemas: require(`./thirdPartySchemas`),
}
