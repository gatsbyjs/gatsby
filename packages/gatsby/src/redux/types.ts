import { IProgram } from "../commands/types"
import { GraphQLFieldExtensionDefinition } from "../schema/extensions"
import { DocumentNode, GraphQLSchema } from "graphql"
import { SchemaComposer } from "graphql-compose"

type SystemPath = string
type Identifier = string
type StructuredLog = any // TODO this should come from structured log interface

export interface IGatsbyPlugin {
  name: string
  version: string
}

export interface IRedirect {
  fromPath: string
  toPath: string
  isPermanent?: boolean
  redirectInBrowser?: boolean
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
  matchPath?: string
  component: SystemPath
  context: Record<string, any>
  componentChunkName: string
  isCreatedByStatefulCreatePages: boolean
  updatedAt: number
  pluginCreator__NODE?: Identifier
  pluginCreatorId?: Identifier
  componentPath?: SystemPath
}

export interface IJob {
  id: string
}

export interface IJobV2 {
  name: string
  inputPaths: string[]
  outputDir: string
  args: Record<string, any> // TODO
}

export type IPageInput = Pick<
  IGatsbyPage,
  "path" | "component" | "context" | "matchPath"
>

export interface IActionOptions {
  traceId?: string
  parentSpan?: Record<string, any> | null // TODO
  followsSpan?: Record<string, any> | null // TODO
}

export interface IPageData {
  id: string
  resultHash: string
}

export interface IPageDataRemove {
  id: string
}

export interface IGatsbyConfig {
  plugins?: {
    // This is the name of the plugin like `gatsby-plugin-manifest
    resolve: string
    options: {
      [key: string]: unknown
    }
  }[]
  siteMetadata?: {
    title?: string
    author?: string
    description?: string
  }
  // @deprecated
  polyfill?: boolean
  developMiddleware?: any
  proxy?: any
  pathPrefix?: string
}

export interface IGatsbyNode {
  id: Identifier
  parent: Identifier | null
  children: Identifier[]
  fields: any
  array?: any[]
  internal: {
    fieldOwners: any // TODO
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
}

export interface IGatsbyError {
  id: string
  context: {
    codeFrame?: any // TODO
    validationErrorMessage: string
    node: any // TODO
  }
  filePath?: any // TODO
  location?: any // TODO
}

export interface IGatsbyPlugin {
  name: string
  version: string
}

export interface IGatsbyPluginContext {
  [key: string]: (...args: any[]) => any
}

type GatsbyNodes = Map<string, IGatsbyNode>

export interface IGatsbyState {
  program: IProgram
  nodes: GatsbyNodes
  nodesByType: Map<string, GatsbyNodes>
  resolvedNodesCache: Map<string, any> // TODO
  nodesTouched: Set<string>
  lastAction: ActionsUnion
  flattenedPlugins: {
    resolve: SystemPath
    id: Identifier
    name: string
    version: string
    pluginOptions: {
      plugins: []
      [key: string]: unknown
    }
    nodeAPIs: (
      | "onPreBoostrap"
      | "onPostBoostrap"
      | "onCreateWebpackConfig"
      | "onCreatePage"
      | "sourceNodes"
      | "createPagesStatefully"
      | "createPages"
      | "onPostBuild"
    )[]
    browserAPIs: (
      | "onRouteUpdate"
      | "registerServiceWorker"
      | "onServiceWorkerActive"
      | "onPostPrefetchPathname"
    )[]
    ssrAPIs: ("onRenderBody" | "onPreRenderHTML")[]
    pluginFilepath: SystemPath
  }[]
  config: IGatsbyConfig
  pages: Map<string, IGatsbyPage>
  schema: GraphQLSchema
  status: {
    plugins: {}
    PLUGINS_HASH: Identifier
  }
  componentDataDependencies: {
    nodes: Map<string, Set<string>>
    connections: Map<string, Set<string>>
  }
  components: Map<
    SystemPath,
    {
      componentPath: SystemPath
      query: string
      pages: Set<string>
      isInBootstrap: boolean
    }
  >
  staticQueryComponents: Map<
    number,
    {
      name: string
      componentPath: SystemPath
      id: Identifier
      query: string
      hash: string
    }
  >
  // @deprecated
  jobs: {
    active: any[] // TODO
    done: any[] // TODO
  }
  jobsV2: {
    incomplete: Map<any, any> // TODO
    complete: Map<any, any>
  }
  webpack: any // TODO This should be the output from ./utils/webpack.config.js
  webpackCompilationHash: string
  redirects: IRedirect[]
  babelrc: {
    stages: {
      develop: any // TODO
      "develop-html": any // TODO
      "build-html": any // TODO
      "build-javascript": any // TODO
    }
  }
  schemaCustomization: {
    composer: SchemaComposer<any>
    context: {} // TODO
    fieldExtensions: {} // TODO
    printConfig: any // TODO
    thridPartySchemas: any[] // TODO
    types: any[] // TODO
  }
  themes: any // TODO
  logs: {
    messages: StructuredLog[]
    activities: {
      [key: string]: {
        id: Identifier
        uuid: Identifier
        text: string
        type: string // TODO make enum
        status: string // TODO make enum
        startTime: [number, number]
        statusText: string
        current: undefined | any // TODO
        total: undefined | any // TODO
        duration: number
      }
    }
    status: string // TODO make enum
  }
  inferenceMetadata: {
    step: string // TODO make enum or union
    typeMap: {
      [key: string]: {
        ignoredFields: Set<string>
        total: number
        dirty: boolean
        fieldMap: any // TODO
      }
    }
  }
  pageDataStats: Map<SystemPath, number>
  pageData: any
}

export interface ICachedReduxState {
  nodes?: IGatsbyState["nodes"]
  status: IGatsbyState["status"]
  componentDataDependencies: IGatsbyState["componentDataDependencies"]
  components: IGatsbyState["components"]
  jobsV2: IGatsbyState["jobsV2"]
  staticQueryComponents: IGatsbyState["staticQueryComponents"]
  webpackCompilationHash: IGatsbyState["webpackCompilationHash"]
  pageDataStats: IGatsbyState["pageDataStats"]
  pageData: IGatsbyState["pageData"]
}

export type ActionsUnion =
  | ICreatePageAction
  | ICreateNodeAction
  | IDeletePageAction
  | IDeleteNodeAction
  | ICreateNodeFieldAction
  | ICreateParentChildLinkAction
  | ISetWebpackConfigAction
  | IReplaceWebpackConfigAction
  | ISetBabelOptionsAction
  | ISetBabelPluginAction
  | ISetBabelPresetAction
  | ICreateJobAction
  | ICreateJobV2Action
  | ISetJobAction
  | IEndJobAction
  | ICreateRedirectAction
  | ISetPluginStatusAction
  | ITouchNodeAction
  | IValidationErrorAction
  | IDeletePageAction
  | IDeleteNodeAction
  | IDeleteNodesAction
  | ISetPageDataAction
  | IRemovePageDataAction
  | ICreatePageDependencyAction
  | IDeleteComponentDependenciesAction
  | IReplaceComponentQueryAction
  | IReplaceStaticQueryAction
  | IQueryExtractedAction
  | IQueryExtractionGraphQLErrorAction
  | IQueryExtractedBabelSuccessAction
  | IQueryExtractionBabelErrorAction
  | ISetProgramStatusAction
  | IPageQueryRunAction
  | IAddThirdPartySchema
  | ICreateTypes
  | ICreateFieldExtension
  | IPrintTypeDefinitions

export interface ICreatePageAction extends IActionOptions {
  type: `CREATE_PAGE`
  plugin?: IGatsbyPlugin
  contextModified: boolean
  payload: IGatsbyPage
}

export interface ICreateNodeAction extends IActionOptions {
  type: `CREATE_NODE`
  plugin?: IGatsbyPlugin
  oldNode: IGatsbyNode
  payload: IGatsbyNode
}

export interface ICreateNodeFieldAction extends IActionOptions {
  type: `ADD_FIELD_TO_NODE`
  plugin: IGatsbyPlugin
  payload: IGatsbyNode
  addedField: string
}

export interface ICreateParentChildLinkAction {
  type: `ADD_CHILD_NODE_TO_PARENT_NODE`
  plugin?: IGatsbyPlugin
  payload: IGatsbyNode
}

export interface ISetWebpackConfigAction {
  type: `SET_WEBPACK_CONFIG`
  plugin: IGatsbyPlugin | null
  payload: any // TODO
}

export interface IReplaceWebpackConfigAction {
  type: `REPLACE_WEBPACK_CONFIG`
  plugin: IGatsbyPlugin | null
  payload: any // TODO
}

export interface ISetBabelOptionsAction {
  type: `SET_BABEL_OPTIONS`
  plugin: IGatsbyPlugin | null
  payload: any // TODO
}

export interface ISetBabelPluginAction {
  type: `SET_BABEL_PLUGIN`
  plugin: IGatsbyPlugin | null
  payload: any // TODO
}

export interface ISetBabelPresetAction {
  type: `SET_BABEL_PRESET`
  plugin: IGatsbyPlugin | null
  payload: any // TODO
}

export interface ICreateJobAction {
  type: `CREATE_JOB`
  plugin: IGatsbyPlugin | null
  payload: IJob
}

export interface ICreateJobV2Action {
  type: `CREATE_JOB_V2`
  plugin: IGatsbyPlugin | null
  payload: {
    job: any // TODO,
    plugin: IGatsbyPlugin | null
  }
}

export interface ISetJobAction {
  type: `SET_JOB`
  plugin: IGatsbyPlugin | null
  payload: IJob
}

export interface IEndJobAction {
  type: `END_JOB`
  plugin: IGatsbyPlugin | null
  payload: IJob
}

export interface ICreateRedirectAction {
  type: `CREATE_REDIRECT`
  payload: IRedirect
}

export interface ISetPluginStatusAction {
  type: `SET_PLUGIN_STATUS`
  plugin: IGatsbyPlugin
  payload: Record<string, any> // TODO
}

export interface ITouchNodeAction extends IActionOptions {
  type: `TOUCH_NODE`
  plugin?: IGatsbyPlugin
  payload: IGatsbyNode["id"]
}

export interface IValidationErrorAction {
  type: `VALIDATION_ERROR`
  error: boolean
}

export interface IDeletePageAction {
  type: `DELETE_PAGE`
  payload: IPageInput
}

export interface IDeleteNodeAction extends IActionOptions {
  type: `DELETE_NODE`
  plugin?: IGatsbyPlugin
  payload: IGatsbyNode // TODO
}

export interface IDeleteNodesAction {
  type: `DELETE_NODES`
  plugin: IGatsbyPlugin
  fullNodes: IGatsbyNode[]
  payload: string[]
}

export interface ISetPageDataAction {
  type: `SET_PAGE_DATA`
  payload: IPageData
}

export interface IRemovePageDataAction {
  type: `REMOVE_PAGE_DATA`
  payload: IPageDataRemove
}

export interface ICreatePageDependencyAction {
  type: `CREATE_COMPONENT_DEPENDENCY`
  plugin: string
  payload: {
    path: string
    nodeId?: string
    connection?: string
  }
}

export interface IDeleteComponentDependenciesAction {
  type: "DELETE_COMPONENTS_DEPENDENCIES"
  payload: {
    paths: string[]
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
  payload: { path: string; componentPath: string; isPage: boolean }
}

export interface IRemoveStaleJobAction {
  type: `REMOVE_STALE_JOB_V2`
  plugin: IGatsbyPlugin
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
  payload: DocumentNode | DocumentNode[]
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
