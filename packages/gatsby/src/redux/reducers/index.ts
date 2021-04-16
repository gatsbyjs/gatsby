import { nodesReducer } from "./nodes"
import { reducer as logReducer } from "gatsby-cli/lib/reporter/redux/reducer"
import { pagesReducer } from "./pages"
import { redirectsReducer } from "./redirects"
import { schemaReducer } from "./schema"
import { definitionsReducer } from "./definitions"
import { staticQueryComponentsReducer } from "./static-query-components"
import { statusReducer } from "./status"
import { webpackReducer } from "./webpack"
import { webpackCompilationHashReducer } from "./webpack-compilation-hash"
import { configReducer } from "./config"
import { lastActionReducer } from "./last-action"
import { jobsV2Reducer } from "./jobsv2"
import { pageDataStatsReducer } from "./page-data-stats"
import { componentsReducer } from "./components"
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
import { queriesReducer } from "./queries"
import { visitedPagesReducer } from "./visited-page"
import { htmlReducer } from "./html"

/**
 * @property exports.nodesTouched Set<string>
 */
export {
  definitionsReducer as definitions,
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
  visitedPagesReducer as visitedPages,
  statusReducer as status,
  componentsReducer as components,
  staticQueryComponentsReducer as staticQueryComponents,
  jobsReducer as jobs,
  jobsV2Reducer as jobsV2,
  webpackReducer as webpack,
  webpackCompilationHashReducer as webpackCompilationHash,
  redirectsReducer as redirects,
  babelrcReducer as babelrc,
  schemaCustomizationReducer as schemaCustomization,
  logReducer as logs,
  inferenceMetadataReducer as inferenceMetadata,
  pageDataStatsReducer as pageDataStats,
  pendingPageDataWritesReducer as pendingPageDataWrites,
  staticQueriesByTemplateReducer as staticQueriesByTemplate,
  queriesReducer as queries,
  htmlReducer as html,
}
