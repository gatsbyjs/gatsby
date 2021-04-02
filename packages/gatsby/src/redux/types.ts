import { IProgram } from "../commands/types"
import { GraphQLFieldExtensionDefinition } from "../schema/extensions"
import { DocumentNode, GraphQLSchema, DefinitionNode } from "graphql"
import { SchemaComposer } from "graphql-compose"
import { IGatsbyCLIState } from "gatsby-cli/src/reporter/redux/types"
import { InternalJob, JobResultInterface } from "../utils/jobs-manager"
import { ITypeMetadata } from "../schema/infer/inference-metadata"

type SystemPath = string
type Identifier = string

export interface IRedirect {
  fromPath: string
  toPath: string
  isPermanent?: boolean
  redirectInBrowser?: boolean
  ignoreCase: boolean
  // Users can add anything to this createRedirect API
  [key: string]: any
}

export enum ProgramStatus {
  BOOTSTRAP_FINISHED = `BOOTSTRAP_FINISHED`,
  BOOTSTRAP_QUERY_RUNNING_FINISHED = `BOOTSTRAP_QUERY_RUNNING_FINISHED`,
}

export interface IGatsbyPage {
  internalComponentName: string
  path: string
  matchPath: undefined | string
  component: SystemPath
  componentChunkName: string
  isCreatedByStatefulCreatePages: boolean
  context: Record<string, unknown>
  updatedAt: number
  // eslint-disable-next-line @typescript-eslint/naming-convention
  pluginCreator___NODE: Identifier
  pluginCreatorId: Identifier
  componentPath: SystemPath
}

export interface IGatsbyFunction {
  path: string
}

export interface IGatsbyConfig {
  plugins?: Array<{
    // This is the name of the plugin like `gatsby-plugin-manifest
    resolve: string
    options: {
      [key: string]: unknown
    }
  }>
  siteMetadata?: {
    title?: string
    author?: string
    description?: string
    siteUrl?: string
    // siteMetadata is free form
    [key: string]: unknown
  }
  // @deprecated
  polyfill?: boolean
  developMiddleware?: any
  proxy?: any
  pathPrefix?: string
  mapping?: Record<string, string>
}

export interface IGatsbyNode {
  id: Identifier
  parent: Identifier
  children: Array<Identifier>
  internal: {
    type: string
    counter: number
    owner: string
    contentDigest: string
    mediaType?: string
    content?: string
    description?: string
  }
  __gatsby_resolved: any // TODO
  [key: string]: unknown
  fields: Array<string>
}

export interface IGatsbyPlugin {
  id: Identifier
  name: string
  version: string
  [key: string]: any
}

export interface IGatsbyPluginContext {
  [key: string]: (...args: Array<any>) => any
}

export interface IGatsbyStaticQueryComponents {
  name: string
  componentPath: SystemPath
  id: Identifier
  query: string
  hash: string
}

export interface IGatsbyPageComponent {
  componentPath: SystemPath
  query: string
  pages: Set<string>
  isInBootstrap: boolean
}

export interface IDefinitionMeta {
  name: string
  def: DefinitionNode
  filePath: string
  text: string
  templateLoc: any
  printedAst: string
  isHook: boolean
  isStaticQuery: boolean
  isFragment: boolean
  hash: string
}

type GatsbyNodes = Map<string, IGatsbyNode>

export interface IGatsbyIncompleteJobV2 {
  job: InternalJob
  plugin: IGatsbyPlugin
}

export interface IGatsbyIncompleteJob {
  job: InternalJob
  plugin: IGatsbyPlugin
}

export interface IGatsbyCompleteJobV2 {
  result: JobResultInterface
  inputPaths: InternalJob["inputPaths"]
}

export interface IPlugin {
  name: string
  options: Record<string, any>
}

export interface IBabelStage {
  plugins: Array<IPlugin>
  presets: Array<IPlugin>
  options: {
    cacheDirectory: boolean
    sourceType: string
    sourceMaps?: string
  }
}

type BabelStageKeys =
  | "develop"
  | "develop-html"
  | "build-html"
  | "build-javascript"

export interface IStateProgram extends IProgram {
  extensions: Array<string>
}

export interface IQueryState {
  dirty: number
  running: number
}

export interface IComponentState {
  componentPath: string
  query: string
  pages: Set<Identifier>
  errors: number
}

export interface IHtmlFileState {
  dirty: number
  isDeleted: boolean
  pageDataHash: string
}

export interface IStaticQueryResultState {
  dirty: number
  staticQueryResultHash: string
}

export type GatsbyNodeAPI =
  | "onPreBoostrap"
  | "onPostBoostrap"
  | "onCreateWebpackConfig"
  | "onCreatePage"
  | "sourceNodes"
  | "createPagesStatefully"
  | "createPages"
  | "onPostBuild"

export interface IGatsbyState {
  program: IStateProgram
  nodes: GatsbyNodes
  nodesByType: Map<string, GatsbyNodes>
  resolvedNodesCache: Map<string, any> // TODO
  nodesTouched: Set<string>
  lastAction: ActionsUnion
  flattenedPlugins: Array<{
    resolve: SystemPath
    id: Identifier
    name: string
    version: string
    pluginOptions: {
      plugins: []
      [key: string]: unknown
    }
    nodeAPIs: Array<GatsbyNodeAPI>
    browserAPIs: Array<
      | "onRouteUpdate"
      | "registerServiceWorker"
      | "onServiceWorkerActive"
      | "onPostPrefetchPathname"
    >
    ssrAPIs: Array<"onRenderBody" | "onPreRenderHTML">
    pluginFilepath: SystemPath
  }>
  config: IGatsbyConfig
  functions: Map<string, IGatsbyFunction>
  pages: Map<string, IGatsbyPage>
  schema: GraphQLSchema
  definitions: Map<string, IDefinitionMeta>
  status: {
    plugins: Record<string, IGatsbyPlugin>
    PLUGINS_HASH: Identifier
  }
  queries: {
    byNode: Map<Identifier, Set<Identifier>>
    byConnection: Map<string, Set<Identifier>>
    queryNodes: Map<Identifier, Set<Identifier>>
    trackedQueries: Map<Identifier, IQueryState>
    trackedComponents: Map<string, IComponentState>
    deletedQueries: Set<Identifier>
    dirtyQueriesListToEmitViaWebsocket: Array<string>
  }
  components: Map<IGatsbyPageComponent["componentPath"], IGatsbyPageComponent>
  staticQueryComponents: Map<
    IGatsbyStaticQueryComponents["id"],
    IGatsbyStaticQueryComponents
  >
  staticQueriesByTemplate: Map<SystemPath, Array<Identifier>>
  pendingPageDataWrites: {
    pagePaths: Set<string>
  }
  // @deprecated
  jobs: {
    active: Array<any> // TODO
    done: Array<any> // TODO
  }
  jobsV2: {
    incomplete: Map<Identifier, IGatsbyIncompleteJobV2>
    complete: Map<Identifier, IGatsbyCompleteJobV2>
  }
  webpack: any // TODO This should be the output from ./utils/webpack.config.js
  webpackCompilationHash: string
  redirects: Array<IRedirect>
  babelrc: {
    stages: {
      [key in BabelStageKeys]: IBabelStage
    }
  }
  schemaCustomization: {
    composer: null | SchemaComposer<any>
    context: Record<string, any>
    fieldExtensions: GraphQLFieldExtensionDefinition
    printConfig: {
      path?: string
      include?: { types?: Array<string>; plugins?: Array<string> }
      exclude?: { types?: Array<string>; plugins?: Array<string> }
      withFieldTypes?: boolean
    } | null
    thirdPartySchemas: Array<GraphQLSchema>
    types: Array<
      string | { typeOrTypeDef: DocumentNode; plugin: IGatsbyPlugin }
    >
  }
  logs: IGatsbyCLIState
  inferenceMetadata: {
    step: string // TODO make enum or union
    typeMap: {
      [key: string]: ITypeMetadata
    }
  }
  pageDataStats: Map<SystemPath, number>
  visitedPages: Map<string, Set<string>>
  html: {
    trackedHtmlFiles: Map<Identifier, IHtmlFileState>
    browserCompilationHash: string
    ssrCompilationHash: string
    trackedStaticQueryResults: Map<string, IStaticQueryResultState>
    unsafeBuiltinWasUsedInSSR: boolean
  }
}

export interface ICachedReduxState {
  nodes?: IGatsbyState["nodes"]
  status: IGatsbyState["status"]
  components: IGatsbyState["components"]
  jobsV2: IGatsbyState["jobsV2"]
  staticQueryComponents: IGatsbyState["staticQueryComponents"]
  webpackCompilationHash: IGatsbyState["webpackCompilationHash"]
  pageDataStats: IGatsbyState["pageDataStats"]
  staticQueriesByTemplate: IGatsbyState["staticQueriesByTemplate"]
  pendingPageDataWrites: IGatsbyState["pendingPageDataWrites"]
  queries: IGatsbyState["queries"]
  html: IGatsbyState["html"]
}

export type ActionsUnion =
  | IAddChildNodeToParentNodeAction
  | IAddFieldToNodeAction
  | IAddThirdPartySchema
  | IApiFinishedAction
  | ICreateFieldExtension
  | ICreateNodeAction
  | ICreatePageAction
  | ICreatePageDependencyAction
  | ICreateTypes
  | IDeleteCacheAction
  | IDeleteNodeAction
  | IDeletePageAction
  | IPageQueryRunAction
  | IPrintTypeDefinitions
  | IQueryClearDirtyQueriesListToEmitViaWebsocket
  | IQueryExtractedAction
  | IQueryExtractedBabelSuccessAction
  | IQueryExtractionBabelErrorAction
  | IQueryExtractionGraphQLErrorAction
  | IQueryStartAction
  | IRemoveStaticQuery
  | IReplaceComponentQueryAction
  | IReplaceStaticQueryAction
  | IReplaceWebpackConfigAction
  | ISetPluginStatusAction
  | ISetProgramStatusAction
  | ISetResolvedNodesAction
  | ISetSchemaAction
  | ISetGraphQLDefinitionsAction
  | ISetSiteFlattenedPluginsAction
  | ISetWebpackCompilationHashAction
  | ISetSSRWebpackCompilationHashAction
  | ISetWebpackConfigAction
  | ITouchNodeAction
  | IUpdatePluginsHashAction
  | ICreateJobV2Action
  | IEndJobV2Action
  | IRemoveStaleJobV2Action
  | IAddPageDataStatsAction
  | IRemoveTemplateComponentAction
  | ISetBabelPluginAction
  | ISetBabelPresetAction
  | ISetBabelOptionsAction
  | ICreateJobAction
  | ISetJobAction
  | IEndJobAction
  | ISetStaticQueriesByTemplateAction
  | IAddPendingPageDataWriteAction
  | IAddPendingTemplateDataWriteAction
  | IClearPendingPageDataWriteAction
  | ICreateResolverContext
  | IClearSchemaCustomizationAction
  | ISetSchemaComposerAction
  | IStartIncrementalInferenceAction
  | IBuildTypeMetadataAction
  | IDisableTypeInferenceAction
  | ISetProgramAction
  | ISetProgramExtensions
  | IDeletedStalePageDataFiles
  | IRemovedHtml
  | ITrackedHtmlCleanup
  | IGeneratedHtml
  | IMarkHtmlDirty
  | ISSRUsedUnsafeBuiltin

export interface IApiFinishedAction {
  type: `API_FINISHED`
  payload: {
    apiName: GatsbyNodeAPI
  }
}

interface ISetBabelPluginAction {
  type: `SET_BABEL_PLUGIN`
  payload: {
    stage: BabelStageKeys
    name: IPlugin["name"]
    options: IPlugin["options"]
  }
}

interface ISetBabelPresetAction {
  type: `SET_BABEL_PRESET`
  payload: {
    stage: BabelStageKeys
    name: IPlugin["name"]
    options: IPlugin["options"]
  }
}

interface ISetBabelOptionsAction {
  type: `SET_BABEL_OPTIONS`
  payload: {
    stage: BabelStageKeys
    name: IPlugin["name"]
    options: IPlugin["options"]
  }
}

export interface ICreateJobV2Action {
  type: `CREATE_JOB_V2`
  payload: {
    job: IGatsbyIncompleteJobV2["job"]
    plugin: IGatsbyIncompleteJobV2["plugin"]
  }
}

export interface IEndJobV2Action {
  type: `END_JOB_V2`
  payload: {
    jobContentDigest: string
    result: JobResultInterface
  }
}

export interface IRemoveStaleJobV2Action {
  type: `REMOVE_STALE_JOB_V2`
  payload: {
    contentDigest: string
  }
}

interface ICreateJobAction {
  type: `CREATE_JOB`
  payload: {
    id: string
    job: IGatsbyIncompleteJob["job"]
  }
  plugin: IGatsbyIncompleteJob["plugin"]
}

interface ISetJobAction {
  type: `SET_JOB`
  payload: {
    id: string
    job: IGatsbyIncompleteJob["job"]
  }
  plugin: IGatsbyIncompleteJob["plugin"]
}

interface IEndJobAction {
  type: `END_JOB`
  payload: {
    id: string
    job: IGatsbyIncompleteJob["job"]
  }
  plugin: IGatsbyIncompleteJob["plugin"]
}

export interface ICreatePageDependencyAction {
  type: `CREATE_COMPONENT_DEPENDENCY`
  plugin?: string
  payload: {
    path: string
    nodeId?: string
    connection?: string
  }
}

export interface IDeleteComponentDependenciesAction {
  type: "DELETE_COMPONENTS_DEPENDENCIES"
  payload: {
    paths: Array<string>
  }
}

export interface IReplaceComponentQueryAction {
  type: "REPLACE_COMPONENT_QUERY"
  payload: {
    query: string
    componentPath: string
  }
}

export interface IReplaceStaticQueryAction {
  type: `REPLACE_STATIC_QUERY`
  plugin: IGatsbyPlugin | null | undefined
  payload: {
    name: string
    componentPath: string
    id: string
    query: string
    hash: string
  }
}

export interface IQueryClearDirtyQueriesListToEmitViaWebsocket {
  type: `QUERY_CLEAR_DIRTY_QUERIES_LIST_TO_EMIT_VIA_WEBSOCKET`
}

export interface IQueryExtractedAction {
  type: `QUERY_EXTRACTED`
  plugin: IGatsbyPlugin
  traceId: string | undefined
  payload: { componentPath: string; query: string }
}

export interface IQueryExtractionGraphQLErrorAction {
  type: `QUERY_EXTRACTION_GRAPHQL_ERROR`
  plugin: IGatsbyPlugin
  traceId: string | undefined
  payload: { componentPath: string; error: string }
}

export interface IQueryExtractedBabelSuccessAction {
  type: `QUERY_EXTRACTION_BABEL_SUCCESS`
  plugin: IGatsbyPlugin
  traceId: string | undefined
  payload: { componentPath: string }
}

export interface IQueryExtractionBabelErrorAction {
  type: `QUERY_EXTRACTION_BABEL_ERROR`
  plugin: IGatsbyPlugin
  traceId: string | undefined
  payload: {
    componentPath: string
    error: Error
  }
}

export interface ISetProgramStatusAction {
  type: `SET_PROGRAM_STATUS`
  plugin: IGatsbyPlugin
  traceId: string | undefined
  payload: ProgramStatus
}

export interface IPageQueryRunAction {
  type: `PAGE_QUERY_RUN`
  plugin: IGatsbyPlugin
  traceId: string | undefined
  payload: {
    path: string
    componentPath: string
    isPage: boolean
    resultHash: string
    queryHash: string
  }
}

export interface IQueryStartAction {
  type: `QUERY_START`
  plugin: IGatsbyPlugin
  traceId: string | undefined
  payload: { path: string; componentPath: string; isPage: boolean }
}

export interface IRemoveStaleJobAction {
  type: `REMOVE_STALE_JOB_V2`
  plugin: IGatsbyPlugin | undefined
  traceId?: string
  payload: { contentDigest: string }
}

export interface IAddThirdPartySchema {
  type: `ADD_THIRD_PARTY_SCHEMA`
  plugin: IGatsbyPlugin
  traceId?: string
  payload: GraphQLSchema
}

export interface ICreateTypes {
  type: `CREATE_TYPES`
  plugin: IGatsbyPlugin
  traceId?: string
  payload: DocumentNode | Array<DocumentNode>
}

export interface ICreateFieldExtension {
  type: `CREATE_FIELD_EXTENSION`
  plugin: IGatsbyPlugin
  traceId?: string
  payload: {
    name: string
    extension: GraphQLFieldExtensionDefinition
  }
}

export interface IPrintTypeDefinitions {
  type: `PRINT_SCHEMA_REQUESTED`
  plugin: IGatsbyPlugin
  traceId?: string
  payload: {
    path?: string
    include?: { types?: Array<string>; plugins?: Array<string> }
    exclude?: { types?: Array<string>; plugins?: Array<string> }
    withFieldTypes?: boolean
  }
}

export interface ICreateResolverContext {
  type: `CREATE_RESOLVER_CONTEXT`
  plugin: IGatsbyPlugin
  traceId?: string
  payload:
    | IGatsbyPluginContext
    | { [camelCasedPluginNameWithoutPrefix: string]: IGatsbyPluginContext }
}

interface IClearSchemaCustomizationAction {
  type: `CLEAR_SCHEMA_CUSTOMIZATION`
}

interface ISetSchemaComposerAction {
  type: `SET_SCHEMA_COMPOSER`
  payload: SchemaComposer<any>
}

export interface ICreateServerVisitedPage {
  type: `CREATE_SERVER_VISITED_PAGE`
  payload: IGatsbyPage
  plugin?: IGatsbyPlugin
}

export interface ICreatePageAction {
  type: `CREATE_PAGE`
  payload: IGatsbyPage
  plugin?: IGatsbyPlugin
  contextModified?: boolean
}

export interface ICreateRedirectAction {
  type: `CREATE_REDIRECT`
  payload: IRedirect
}

export interface IDeleteCacheAction {
  type: `DELETE_CACHE`
  cacheIsCorrupt?: boolean
}

export interface IRemoveTemplateComponentAction {
  type: `REMOVE_STATIC_QUERIES_BY_TEMPLATE`
  payload: {
    componentPath: string
  }
}

export interface ISetStaticQueriesByTemplateAction {
  type: `SET_STATIC_QUERIES_BY_TEMPLATE`
  payload: {
    componentPath: string
    staticQueryHashes: Array<Identifier>
  }
}

export interface IAddPendingPageDataWriteAction {
  type: `ADD_PENDING_PAGE_DATA_WRITE`
  payload: {
    path: string
  }
}

export interface IAddPendingTemplateDataWriteAction {
  type: `ADD_PENDING_TEMPLATE_DATA_WRITE`
  payload: {
    componentPath: SystemPath
    pages: Array<string>
  }
}

export interface IClearPendingPageDataWriteAction {
  type: `CLEAR_PENDING_PAGE_DATA_WRITE`
  payload: {
    page: string
  }
}

export interface IDeletePageAction {
  type: `DELETE_PAGE`
  payload: IGatsbyPage
}

export interface IRemoveStaticQuery {
  type: `REMOVE_STATIC_QUERY`
  payload: IGatsbyStaticQueryComponents["id"]
}

export interface ISetWebpackCompilationHashAction {
  type: `SET_WEBPACK_COMPILATION_HASH`
  payload: IGatsbyState["webpackCompilationHash"]
}

export interface ISetSSRWebpackCompilationHashAction {
  type: `SET_SSR_WEBPACK_COMPILATION_HASH`
  payload: string
}

export interface IUpdatePluginsHashAction {
  type: `UPDATE_PLUGINS_HASH`
  payload: Identifier
}

export interface ISetPluginStatusAction {
  type: `SET_PLUGIN_STATUS`
  plugin: IGatsbyPlugin
  payload: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
}

export interface IReplaceWebpackConfigAction {
  type: `REPLACE_WEBPACK_CONFIG`
  payload: IGatsbyState["webpack"]
}

export interface ISetWebpackConfigAction {
  type: `SET_WEBPACK_CONFIG`
  payload: Partial<IGatsbyState["webpack"]>
}

export interface ISetSchemaAction {
  type: `SET_SCHEMA`
  payload: IGatsbyState["schema"]
}

export interface ISetGraphQLDefinitionsAction {
  type: `SET_GRAPHQL_DEFINITIONS`
  payload: IGatsbyState["definitions"]
}

export interface ISetSiteConfig {
  type: `SET_SITE_CONFIG`
  payload: IGatsbyState["config"]
}

export interface ISetSiteFunctions {
  type: `SET_SITE_FUNCTIONS`
  payload: IGatsbyState["functions"]
}

export interface ICreateNodeAction {
  type: `CREATE_NODE`
  payload: IGatsbyNode
  oldNode?: IGatsbyNode
}

export interface IAddFieldToNodeAction {
  type: `ADD_FIELD_TO_NODE`
  payload: IGatsbyNode
  addedField: string
}

export interface IAddChildNodeToParentNodeAction {
  type: `ADD_CHILD_NODE_TO_PARENT_NODE`
  payload: IGatsbyNode
}

export interface IDeleteNodeAction {
  type: `DELETE_NODE`
  // FIXME: figure out why payload can be undefined here
  payload: IGatsbyNode | void
}

export interface ISetSiteFlattenedPluginsAction {
  type: `SET_SITE_FLATTENED_PLUGINS`
  payload: IGatsbyState["flattenedPlugins"]
}

export interface ISetResolvedNodesAction {
  type: `SET_RESOLVED_NODES`
  payload: {
    key: string
    nodes: IGatsbyState["resolvedNodesCache"]
  }
}

export interface IAddPageDataStatsAction {
  type: `ADD_PAGE_DATA_STATS`
  payload: {
    pagePath: string
    filePath: SystemPath
    size: number
    pageDataHash: string
  }
}

export interface ITouchNodeAction {
  type: `TOUCH_NODE`
  payload: Identifier
}

interface IStartIncrementalInferenceAction {
  type: `START_INCREMENTAL_INFERENCE`
}

interface IBuildTypeMetadataAction {
  type: `BUILD_TYPE_METADATA`
  payload: {
    nodes: Array<IGatsbyNode>
    typeName: string
  }
}

interface IDisableTypeInferenceAction {
  type: `DISABLE_TYPE_INFERENCE`
  payload: Array<string>
}

interface ISetProgramAction {
  type: `SET_PROGRAM`
  payload: IStateProgram
}

interface ISetProgramExtensions {
  type: `SET_PROGRAM_EXTENSIONS`
  payload: Array<string>
}

interface IDeletedStalePageDataFiles {
  type: `DELETED_STALE_PAGE_DATA_FILES`
  payload: {
    pagePathsToClear: Set<string>
  }
}

interface IRemovedHtml {
  type: `HTML_REMOVED`
  payload: string
}

interface ITrackedHtmlCleanup {
  type: `HTML_TRACKED_PAGES_CLEANUP`
  payload: Set<string>
}

interface IGeneratedHtml {
  type: `HTML_GENERATED`
  payload: Array<string>
}

interface IMarkHtmlDirty {
  type: `HTML_MARK_DIRTY_BECAUSE_STATIC_QUERY_RESULT_CHANGED`
  payload: {
    pages: Set<string>
    staticQueryHashes: Set<string>
  }
}

interface ISSRUsedUnsafeBuiltin {
  type: `SSR_USED_UNSAFE_BUILTIN`
}
