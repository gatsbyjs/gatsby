import { IProgram } from "../commands/types"
import { GraphQLSchema } from "graphql"
import { SchemaComposer } from "graphql-compose"

type SystemPath = string
type Identifier = string
type StructuredLog = any // TODO this should come from structured log interface

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
  redirects: any[] // TODO
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
  plugin: Plugin | null | undefined
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
  plugin: Plugin
  traceId: string | undefined
  payload: { componentPath: string; query: string }
}

export interface IQueryExtractionGraphQLErrorAction {
  type: `QUERY_EXTRACTION_GRAPHQL_ERROR`
  plugin: Plugin
  traceId: string | undefined
  payload: { componentPath: string; error: string }
}

export interface IQueryExtractedBabelSuccessAction {
  type: `QUERY_EXTRACTION_BABEL_SUCCESS`
  plugin: Plugin
  traceId: string | undefined
  payload: { componentPath: string }
}

export interface IQueryExtractionBabelErrorAction {
  type: `QUERY_EXTRACTION_BABEL_ERROR`
  plugin: Plugin
  traceId: string | undefined
  payload: {
    componentPath: string
    error: Error
  }
}

export interface ISetProgramStatusAction {
  type: `SET_PROGRAM_STATUS`
  plugin: Plugin
  traceId: string | undefined
  payload: ProgramStatus
}

export interface IPageQueryRunAction {
  type: `PAGE_QUERY_RUN`
  plugin: Plugin
  traceId: string | undefined
  payload: { path: string; componentPath: string; isPage: boolean }
}

export interface IRemoveStaleJobAction {
  type: `REMOVE_STALE_JOB_V2`
  plugin: Plugin
  traceId?: string
  payload: { contentDigest: string }
}
