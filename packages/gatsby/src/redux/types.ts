import { GraphQLSchema } from "graphql"
import { IProgram } from "../commands/types"
import { GraphQLFieldExtensionDefinition } from "../schema/extensions"

export enum ProgramStatus {
  BOOTSTRAP_FINISHED = `BOOTSTRAP_FINISHED`,
  BOOTSTRAP_QUERY_RUNNING_FINISHED = `BOOTSTRAP_QUERY_RUNNING_FINISHED`,
}

export interface IReduxNode {
  id: string
  internal: {
    type: string
  }
}

export interface IGatsbyPlugin {
  name: string
  version: string
}

export interface IReduxState {
  status: ProgramStatus
  nodes?: Map<string, IReduxNode>
  nodesByType?: Map<any, any> // TODO
  jobsV2: any // TODO
  lastAction: ActionsUnion
  componentDataDependencies: {
    connections: any // TODO
    nodes: any // TODO
  }
  components: any // TODO
  staticQueryComponents: any // TODO
  webpackCompilationHash: any // TODO
  pageDataStats: any // TODO
  jobs: {
    active: Array<any> // TODO
  }
  schema: GraphQLSchema
  schemaCustomization: any
  config: {
    developMiddleware: any
    proxy: any
  }
  pageData: any
  pages: any
  babelrc: any
  themes: any
  flattenedPlugins: any
  program: IProgram
}

export interface ICachedReduxState {
  nodes: IReduxState["nodes"]
  status: IReduxState["status"]
  componentDataDependencies: IReduxState["componentDataDependencies"]
  components: IReduxState["components"]
  jobsV2: IReduxState["jobsV2"]
  staticQueryComponents: IReduxState["staticQueryComponents"]
  webpackCompilationHash: IReduxState["webpackCompilationHash"]
  pageDataStats: IReduxState["pageDataStats"]
  pageData: IReduxState["pageData"]
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
  | IAddThirdPartySchema
  | ICreateTypes
  | ICreateFieldExtension
  | IPrintTypeDefinitions

export interface ICreatePageDependencyAction {
  type: `CREATE_COMPONENT_DEPENDENCY`
  plugin: string
  payload: {
    path: string
    nodeId: string
    connection: string
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
  payload: any
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
  payload: object
}
