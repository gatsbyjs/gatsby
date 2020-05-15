import { nodeReducer } from "./nodes"
const nodesByType = require(`./nodes-by-type`)
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
import { jobsV2Reducer } from "./jobsv2"
import { componentDataDependenciesReducer } from "./component-data-dependencies"

/**
 * @property exports.nodesTouched Set<string>
 */
module.exports = {
  program: require(`./program`),
  nodes: nodeReducer,
  nodesByType: nodesByType,
  resolvedNodesCache: require(`./resolved-nodes`),
  nodesTouched: require(`./nodes-touched`),
  lastAction: lastAction,
  flattenedPlugins: require(`./flattened-plugins`),
  config: require(`./config`),
  schema: schemaReducer,
  pages: pagesReducer,
  status: statusReducer,
  componentDataDependencies: componentDataDependenciesReducer,
  components: require(`./components`),
  staticQueryComponents: staticQueryComponentsReducer,
  jobs: require(`./jobs`),
  jobsV2: jobsV2Reducer,
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
