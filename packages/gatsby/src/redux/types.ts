import { GraphQLSchema } from "graphql"
import { IProgram } from "../commands/types"

export interface IGatsbyPlugin {
  name: string
  version: string
}

export enum ProgramStatus {
  BOOTSTRAP_FINISHED = `BOOTSTRAP_FINISHED`,
  BOOTSTRAP_QUERY_RUNNING_FINISHED = `BOOTSTRAP_QUERY_RUNNING_FINISHED`,
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

export interface IPage {
  path: string
  matchPath?: string
  component: string
  context: Record<string, any> // TODO
  internalComponentName: string
  componentChunkName: string
  updatedAt: number
  isCreatedByStatefulCreatePages: boolean
}

export type IPageInput = Pick<
  IPage,
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

export interface IReduxNode {
  id: string
  parent: string | null
  children: IReduxNode["id"][]
  fields: any
  array?: any[]
  internal: {
    owner: string
    counter: number
    fieldOwners: any // TODO
    mediaType: string
    type: string
    content: any
    contentDigest: string
    description: string
  }
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
    pathPrefix: string
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

export interface ICreatePageAction extends IActionOptions {
  type: `CREATE_PAGE`
  plugin?: IGatsbyPlugin
  contextModified: boolean
  payload: IPage
}

export interface ICreateNodeAction extends IActionOptions {
  type: `CREATE_NODE`
  plugin: IGatsbyPlugin
  oldNode: IReduxNode
  payload: IReduxNode
}

export interface ICreateNodeFieldAction extends IActionOptions {
  type: `ADD_FIELD_TO_NODE`
  plugin: IGatsbyPlugin
  payload: IReduxNode
  addedField: string
}

export interface ICreateParentChildLinkAction {
  type: `ADD_CHILD_NODE_TO_PARENT_NODE`
  plugin?: IGatsbyPlugin
  payload: IReduxNode
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
  payload: {
    fromPath: string
    isPermanent: boolean
    redirectInBrowser: boolean
    toPath: string
  }
}

export interface ISetPluginStatusAction {
  type: `SET_PLUGIN_STATUS`
  plugin: IGatsbyPlugin
  payload: Record<string, any> // TODO
}

export interface ITouchNodeAction {
  type: `TOUCH_NODE`
  plugin?: IGatsbyPlugin
  payload: IReduxNode["id"]
}

export interface IValidationErrorAction {
  type: `VALIDATION_ERROR`
  error: boolean
}

export interface IDeletePageAction {
  type: `DELETE_PAGE`
  payload: IPageInput
}

export interface IDeleteNodeAction {
  type: `DELETE_NODE`
  plugin?: IGatsbyPlugin
  payload: IReduxNode // TODO
}

export interface IDeleteNodesAction {
  type: `DELETE_NODES`
  plugin: IGatsbyPlugin
  fullNodes: IReduxNode[]
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
