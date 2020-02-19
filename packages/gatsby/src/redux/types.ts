export enum ProgramStatus {
  BOOTSTRAP_FINISHED = `BOOTSTRAP_FINISHED`,
  BOOTSTRAP_QUERY_RUNNING_FINISHED = `BOOTSTRAP_QUERY_RUNNING_FINISHED`,
}

export interface IReduxState {
  status: ProgramStatus
  nodes?: {
    id: string
    internal: {
      type: string
    }
  }[]
  nodesByType?: Map<any, any> // TODO
  jobsV2: any // TODO
  lastAction: ActionsUnion
  componentDataDependencies: any // TODO
  components: any // TODO
  staticQueryComponents: any // TODO
  webpackCompilationHash: any // TODO
  pageDataStats: any // TODO
  jobs: {
    active: Array<any> // TODO
  }
  schema: any
  schemaCustomization: any
  config: {
    developMiddleware: any
    proxy: any
  }
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
