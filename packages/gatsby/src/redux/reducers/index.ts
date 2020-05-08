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
import nodeReducer from "./nodes"
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
// const lokiNodes = require(`../../db/loki/nodes`).reducer

// const backend = process.env.GATSBY_DB_NODES || `redux`
const backend = `redux`

export function getNodesReducer(): IGatsbyState["nodes"] {
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

export function getNodesByTypeReducer(): IGatsbyState["nodesByType"] {
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
export {
  programReducer as program,
  resolvedNodesReducer as resolvedNodesCache,
  nodesTouchedReducer as nodesTouched,
  lastActionReducer as lastAction,
  flattenedPluginsReducer as flattenedPlugins,
  configReducer as config,
  schemaReducer as schema,
  pagesReducer as pages,
  statusReducer as status,
  componentDataDependenciesReducer as componentDataDependencies,
  componentsReducer as components,
  staticQueryComponentsReducer as staticQueryComponents,
  jobsReducer as jobs,
  jobsv2Reducer as jobsV2,
  webpackReducer as webpack,
  webpackCompilationHashReducer as webpackCompilationHash,
  redirectsReducer as redirects,
  babelrcReducer as babelrc,
  schemaCustomizationReducer as schemaCustomization,
  themesReducer as themes,
  logReducer as logs,
  inferenceMetadataReducer as inferenceMetadata,
  pageDataStatsReducer as pageDataStats,
  pageDataReducer as pageData,
}
