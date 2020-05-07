const reduxNodes = require(`./nodes`)
const lokiNodes = require(`../../db/loki/nodes`).reducer
import { reducer as logReducer } from "gatsby-cli/lib/reporter/redux/reducer"
import { pagesReducer } from "./pages"
import { redirectsReducer } from "./redirects"
import { schemaReducer } from "./schema"
import { staticQueryComponentsReducer } from "./static-query-components"
import { statusReducer } from "./status"
import { webpackReducer } from "./webpack"
import { pageDataReducer } from "./page-data"
import { themesReducer } from "./themes"
import { webpackCompilationHashReducer } from "./webpack-compilation-hash"
import { configReducer } from "./config"
import nodesByTypeReducer from "./nodes-by-type"
import programReducer from "./program"
import resolvedNodesReducer from "./resolved-nodes"
import nodesTouchedReducer from "./nodes-touched"
import lastActionReducer from "./last-action"
import flattenedPluginsReducer from "./flattened-plugins"
import componentDataDependenciesReducer from "./component-data-dependencies"
import componentsReducer from "./components"
import jobsReducer from "./jobs"
import jobsv2Reducer from "./jobsv2"
import babelrcReducer from "./babelrc"
import schemaCustomizationReducer from "./schema-customization"
import inferenceMetadataReducer from "./inference-metadata"
import pageDataStatsReducer from "./page-data-stats"
import { IGatsbyState } from "../types"

// const backend = process.env.GATSBY_DB_NODES || `redux`
const backend = `redux`

function getNodesReducer(): IGatsbyState["nodes"] {
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

function getNodesByTypeReducer(): IGatsbyState["nodesByType"] {
  let nodesReducer
  switch (backend) {
    case `redux`:
      nodesReducer = nodesByTypeReducer
      break
    case `loki`:
      nodesReducer = (state = null): null => null
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
export const reducers = {
  program: programReducer,
  nodes: getNodesReducer(),
  nodesByType: getNodesByTypeReducer(),
  resolvedNodesCache: resolvedNodesReducer,
  nodesTouched: nodesTouchedReducer,
  lastAction: lastActionReducer,
  flattenedPlugins: flattenedPluginsReducer,
  config: configReducer,
  schema: schemaReducer,
  pages: pagesReducer,
  status: statusReducer,
  componentDataDependencies: componentDataDependenciesReducer,
  components: componentsReducer,
  staticQueryComponents: staticQueryComponentsReducer,
  jobs: jobsReducer,
  jobsV2: jobsv2Reducer,
  webpack: webpackReducer,
  webpackCompilationHash: webpackCompilationHashReducer,
  redirects: redirectsReducer,
  babelrc: babelrcReducer,
  schemaCustomization: schemaCustomizationReducer,
  themes: themesReducer,
  logs: logReducer,
  inferenceMetadata: inferenceMetadataReducer,
  pageDataStats: pageDataStatsReducer,
  pageData: pageDataReducer,
}
