import { typeOwnersReducer } from "./type-owners"
import { nodesReducer } from "./nodes"
import { reducer as logReducer } from "gatsby-cli/lib/reporter/redux/reducers/logs"
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
import { functionsReducer } from "./functions"
import { telemetryReducer } from "./telemetry"
import { nodeManifestReducer } from "./node-manifest"
import { reducer as pageTreeReducer } from "gatsby-cli/lib/reporter/redux/reducers/page-tree"
import { setRequestHeadersReducer } from "./set-request-headers"
import { statefulSourcePluginsReducer } from "./stateful-source-plugins"
import { slicesReducer } from "./slices"
import { componentsUsingSlicesReducer } from "./components-using-slices"
import { slicesByTemplateReducer } from "./slices-by-template"
import { adapterReducer } from "./adapter"
import { remoteFileAllowedUrlsReducer } from "./remote-file-allowed-urls"
import { nodesStagingReducer } from "./nodes-staging"

/**
 * @property exports.nodesTouched Set<string>
 */
export {
  definitionsReducer as definitions,
  programReducer as program,
  typeOwnersReducer as typeOwners,
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
  functionsReducer as functions,
  nodeManifestReducer as nodeManifests,
  pageTreeReducer as pageTree,
  setRequestHeadersReducer as requestHeaders,
  statefulSourcePluginsReducer as statefulSourcePlugins,
  slicesReducer as slices,
  componentsUsingSlicesReducer as componentsUsingSlices,
  slicesByTemplateReducer as slicesByTemplate,
  telemetryReducer as telemetry,
  adapterReducer as adapter,
  remoteFileAllowedUrlsReducer as remoteFileAllowedUrls,
  nodesStagingReducer as nodesStaging,
}
