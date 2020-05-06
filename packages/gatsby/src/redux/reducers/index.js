import { nodeReducer } from "./nodes"
const lokiNodes = require(`../../db/loki/nodes`).reducer
import { pagesReducer } from "./pages"
import { redirectsReducer } from "./redirects"
import { schemaReducer } from "./schema"
import { staticQueryComponentsReducer } from "./static-query-components"
import { statusReducer } from "./status"
import { webpackReducer } from "./webpack"
import { pageDataReducer } from "./page-data"
import { themesReducer } from "./themes"
import { webpackCompilationHashReducer } from "./webpack-compilation-hash"
import { reducer as logReducer } from "gatsby-cli/lib/reporter/redux/reducer"
import { lastAction } from "./last-action"

// const backend = process.env.GATSBY_DB_NODES || `redux`
const backend = `redux`

function getNodesReducer() {
  let nodesReducer
  switch (backend) {
    case `redux`:
      nodesReducer = nodeReducer
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

function getNodesByTypeReducer() {
  let nodesReducer
  switch (backend) {
    case `redux`:
      nodesReducer = require(`./nodes-by-type`)
      break
    case `loki`:
      nodesReducer = (state = null) => null
      break
    default:
      throw new Error(
        `Unsupported DB nodes backend (value of env var GATSBY_DB_NODES)`
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
  lastAction: lastAction,
  flattenedPlugins: require(`./flattened-plugins`),
  config: require(`./config`),
  schema: schemaReducer,
  pages: pagesReducer,
  status: statusReducer,
  componentDataDependencies: require(`./component-data-dependencies`),
  components: require(`./components`),
  staticQueryComponents: staticQueryComponentsReducer,
  jobs: require(`./jobs`),
  jobsV2: require(`./jobsv2`),
  webpack: webpackReducer,
  webpackCompilationHash: webpackCompilationHashReducer,
  redirects: redirectsReducer,
  babelrc: require(`./babelrc`),
  schemaCustomization: require(`./schema-customization`),
  themes: themesReducer,
  logs: logReducer,
  inferenceMetadata: require(`./inference-metadata`),
  pageDataStats: require(`./page-data-stats`),
  pageData: pageDataReducer,
}
