import { nodeReducer } from "./nodes"
import { nodesByTypeReducer } from "./nodes-by-type"
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
import { flattenedPluginsReducer } from "./flattened-plugins"
import { resolvedNodesCacheReducer } from "./resolved-nodes"
import { pageDataStatsReducer } from "./page-data-stats"
import { componentsReducer } from "./components"
import { componentDataDependenciesReducer } from "./component-data-dependencies"
import { nodesTouchedReducer } from "./nodes-touched"
import { babelrcReducer } from "./babelrc"
import { jobsReducer } from "./jobs"

/**
 * @property exports.nodesTouched Set<string>
 */
module.exports = {
  program: require(`./program`),
  nodes: nodeReducer,
  nodesByType: nodesByTypeReducer,
  resolvedNodesCache: resolvedNodesCacheReducer,
  nodesTouched: nodesTouchedReducer,
  lastAction: lastAction,
  flattenedPlugins: flattenedPluginsReducer,
  config: require(`./config`),
  schema: schemaReducer,
  pages: pagesReducer,
  status: statusReducer,
  componentDataDependencies: componentDataDependenciesReducer,
  components: componentsReducer,
  staticQueryComponents: staticQueryComponentsReducer,
  jobs: jobsReducer,
  jobsV2: jobsV2Reducer,
  webpack: webpackReducer,
  webpackCompilationHash: webpackCompilationHashReducer,
  redirects: redirectsReducer,
  babelrc: babelrcReducer,
  schemaCustomization: require(`./schema-customization`),
  themes: themesReducer,
  logs: logReducer,
  inferenceMetadata: require(`./inference-metadata`),
  pageDataStats: pageDataStatsReducer,
  pageData: pageDataReducer,
}
