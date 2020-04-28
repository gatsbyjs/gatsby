import { IProgram } from "../commands/types"
import { GraphQLFieldExtensionDefinition } from "../schema/extensions"
import { DocumentNode, GraphQLSchema } from "graphql"
import { SchemaComposer } from "graphql-compose"
import { IGatsbyCLIState } from "gatsby-cli/src/reporter/redux/types"

type SystemPath = string
type Identifier = string

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
  matchPath: undefined | string
  component: SystemPath
  componentChunkName: string
  isCreatedByStatefulCreatePages: boolean
  context: {}
  updatedAt: number
  pluginCreator__NODE: Identifier
  pluginCreatorId: Identifier
  componentPath: SystemPath
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
  parent: Identifier
  children: Identifier[]
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
}

export interface IGatsbyPlugin {
  name: string
  version: string
}

export interface IGatsbyPluginContext {
  [key: string]: (...args: any[]) => any
}

export interface IGatsbyStaticQueryComponents {
  name: string
  componentPath: SystemPath
  id: Identifier
  query: string
  hash: string
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
    IGatsbyStaticQueryComponents["id"],
    IGatsbyStaticQueryComponents
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
  logs: IGatsbyCLIState
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
  | ICreatePageDependencyAction
  | IDeleteCacheAction
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
  | IRemoveStaticQuery
  | ISetWebpackCompilationHashAction

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

export interface ICreateRedirectAction {
  type: `CREATE_REDIRECT`
  payload: IRedirect
}

export interface IDeleteCacheAction {
  type: `DELETE_CACHE`
}

export interface IReplaceStaticQueryAction {
  type: `REPLACE_STATIC_QUERY`
  payload: IGatsbyStaticQueryComponents
}

export interface IRemoveStaticQuery {
  type: `REMOVE_STATIC_QUERY`
  payload: IGatsbyStaticQueryComponents["id"]
}

export interface ISetWebpackCompilationHashAction {
  type: `SET_WEBPACK_COMPILATION_HASH`
  payload: IGatsbyState["webpackCompilationHash"]
}
