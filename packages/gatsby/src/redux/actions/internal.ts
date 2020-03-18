import {
  ProgramStatus,
  ICreatePageDependencyAction,
  IDeleteComponentDependenciesAction,
  IReplaceComponentQueryAction,
  IReplaceStaticQueryAction,
  IQueryExtractedAction,
  IQueryExtractionGraphQLErrorAction,
  IQueryExtractedBabelSuccessAction,
  IQueryExtractionBabelErrorAction,
  ISetProgramStatusAction,
  IPageQueryRunAction,
  IRemoveStaleJobAction,
} from "../types"

/**
 * Create a dependency between a page and data. Probably for
 * internal use only.
 * @param {Object} $0
 * @param {string} $0.path the path to the page
 * @param {string} $0.nodeId A node ID
 * @param {string} $0.connection A connection type
 * @private
 */
export const createPageDependency = (
  {
    path,
    nodeId,
    connection,
  }: { path: string; nodeId: string; connection: string },
  plugin = ``
): ICreatePageDependencyAction => {
  return {
    type: `CREATE_COMPONENT_DEPENDENCY`,
    plugin,
    payload: {
      path,
      nodeId,
      connection,
    },
  }
}

/**
 * Delete dependencies between an array of pages and data. Probably for
 * internal use only. Used when deleting pages.
 * @param {Array} paths the paths to delete.
 * @private
 */
export const deleteComponentsDependencies = (
  paths: string[]
): IDeleteComponentDependenciesAction => {
  return {
    type: `DELETE_COMPONENTS_DEPENDENCIES`,
    payload: {
      paths,
    },
  }
}

/**
 * When the query watcher extracts a GraphQL query, it calls
 * this to store the query with its component.
 * @private
 */
export const replaceComponentQuery = ({
  query,
  componentPath,
}: {
  query: string
  componentPath: string
}): IReplaceComponentQueryAction => {
  return {
    type: `REPLACE_COMPONENT_QUERY`,
    payload: {
      query,
      componentPath,
    },
  }
}

/**
 * When the query watcher extracts a "static" GraphQL query from <StaticQuery>
 * components, it calls this to store the query with its component.
 * @private
 */
export const replaceStaticQuery = (
  args: any,
  plugin: Plugin | null | undefined = null
): IReplaceStaticQueryAction => {
  return {
    type: `REPLACE_STATIC_QUERY`,
    plugin,
    payload: args,
  }
}

/**
 *
 * Report that a query has been extracted from a component. Used by
 * query-compiler.js.
 *
 * @param {Object} $0
 * @param {componentPath} $0.componentPath The path to the component that just had
 * its query read.
 * @param {query} $0.query The GraphQL query that was extracted from the component.
 * @private
 */
export const queryExtracted = (
  { componentPath, query }: { componentPath: string; query: string },
  plugin: Plugin,
  traceId?: string
): IQueryExtractedAction => {
  return {
    type: `QUERY_EXTRACTED`,
    plugin,
    traceId,
    payload: { componentPath, query },
  }
}

/**
 *
 * Report that the Relay Compiler found a graphql error when attempting to extract a query
 *
 * @param {Object} $0
 * @param {componentPath} $0.componentPath The path to the component that just had
 * its query read.
 * @param {error} $0.error The GraphQL query that was extracted from the component.
 * @private
 */
export const queryExtractionGraphQLError = (
  { componentPath, error }: { componentPath: string; error: string },
  plugin: Plugin,
  traceId?: string
): IQueryExtractionGraphQLErrorAction => {
  return {
    type: `QUERY_EXTRACTION_GRAPHQL_ERROR`,
    plugin,
    traceId,
    payload: { componentPath, error },
  }
}

/**
 *
 * Report that babel was able to extract the graphql query.
 * Indicates that the file is free of JS errors.
 *
 * @param {Object} $0
 * @param {componentPath} $0.componentPath The path to the component that just had
 * its query read.
 * @private
 */
export const queryExtractedBabelSuccess = (
  { componentPath },
  plugin: Plugin,
  traceId?: string
): IQueryExtractedBabelSuccessAction => {
  return {
    type: `QUERY_EXTRACTION_BABEL_SUCCESS`,
    plugin,
    traceId,
    payload: { componentPath },
  }
}

/**
 *
 * Report that the Relay Compiler found a babel error when attempting to extract a query
 *
 * @param {Object} $0
 * @param {componentPath} $0.componentPath The path to the component that just had
 * its query read.
 * @param {error} $0.error The Babel error object
 * @private
 */
export const queryExtractionBabelError = (
  { componentPath, error }: { componentPath: string; error: Error },
  plugin: Plugin,
  traceId?: string
): IQueryExtractionBabelErrorAction => {
  return {
    type: `QUERY_EXTRACTION_BABEL_ERROR`,
    plugin,
    traceId,
    payload: { componentPath, error },
  }
}

/**
 * Set overall program status e.g. `BOOTSTRAPING` or `BOOTSTRAP_FINISHED`.
 *
 * @param {string} Program status
 * @private
 */
export const setProgramStatus = (
  status: ProgramStatus,
  plugin: Plugin,
  traceId?: string
): ISetProgramStatusAction => {
  return {
    type: `SET_PROGRAM_STATUS`,
    plugin,
    traceId,
    payload: status,
  }
}

/**
 * Broadcast that a page's query was run.
 *
 * @param {string} Path to the page component that changed.
 * @private
 */
export const pageQueryRun = (
  { path, componentPath, isPage },
  plugin: Plugin,
  traceId?: string
): IPageQueryRunAction => {
  return {
    type: `PAGE_QUERY_RUN`,
    plugin,
    traceId,
    payload: { path, componentPath, isPage },
  }
}

/**
 * Remove jobs which are marked as stale (inputPath doesn't exists)
 *
 * @param {string} contentDigest
 * @private
 */
export const removeStaleJob = (
  contentDigest: string,
  plugin: Plugin,
  traceId?: string
): IRemoveStaleJobAction => {
  return {
    type: `REMOVE_STALE_JOB_V2`,
    plugin,
    traceId,
    payload: {
      contentDigest,
    },
  }
}
