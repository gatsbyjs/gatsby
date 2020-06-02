import { nodesReducer } from "./nodes"
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
import { lastActionReducer } from "./last-action"
import { jobsV2Reducer } from "./jobsv2"
import { pageDataStatsReducer } from "./page-data-stats"
import { componentsReducer } from "./components"
import { componentDataDependenciesReducer } from "./component-data-dependencies"
import { babelrcReducer } from "./babelrc"
import { jobsReducer } from "./jobs"
import { nodesByTypeReducer } from "./nodes-by-type"
import { programReducer } from "./program"
import { resolvedNodesCacheReducer } from "./resolved-nodes"
import { nodesTouchedReducer } from "./nodes-touched"
import { flattenedPluginsReducer } from "./flattened-plugins"
import { pendingPageDataWritesReducer } from "./pending-page-data-writes"
import { schemaCustomizationReducer } from "./schema-customization"
import { inferenceMetadataReducer } from "./inference-metadata"
import { staticQueriesByTemplateReducer } from "./static-queries-by-template"
import { modulesReducer } from "./modules"
import { queryModuleDependenciesReducer } from "./query-module-dependencies"

/**
 * @property exports.nodesTouched Set<string>
 */
export {
  programReducer as program,
  nodesReducer as nodes,
  nodesByTypeReducer as nodesByType,
  resolvedNodesCacheReducer as resolvedNodesCache,
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
  jobsV2Reducer as jobsV2,
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
  pendingPageDataWritesReducer as pendingPageDataWrites,
  staticQueriesByTemplateReducer as staticQueriesByTemplate,
  modulesReducer as modules,
  queryModuleDependenciesReducer as queryModuleDependencies,
}
