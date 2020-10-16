import {
  ActionsUnion,
  IComponentState,
  IGatsbyState,
  IQueryState,
} from "../types"

type QueryId = string // page query path or static query id
type ComponentPath = string
type NodeId = string
type ConnectionName = string

export const FLAG_DIRTY_PAGE = 0b0001
export const FLAG_DIRTY_TEXT = 0b0010
export const FLAG_DIRTY_DATA = 0b0100

export const FLAG_ERROR_BABEL = 0b0001

const initialState = (): IGatsbyState["queries"] => {
  return {
    byNode: new Map<NodeId, Set<QueryId>>(),
    byConnection: new Map<ConnectionName, Set<QueryId>>(),
    trackedQueries: new Map<QueryId, IQueryState>(),
    trackedComponents: new Map<ComponentPath, IComponentState>(),
  }
}

const initialQueryState = (): IQueryState => {
  return {
    dirty: -1, // unknown, must be set right after init
    errors: 0,
  }
}

const initialComponentState = (): IComponentState => {
  return {
    componentPath: ``,
    query: ``,
    pages: new Set<QueryId>(),
    // TODO: staticQueries: new Set<QueryId>()
  }
}

/**
 * Tracks query dirtiness. Dirty queries are queries that:
 *
 * - depend on nodes or node collections (via `actions.createPageDependency`) that have changed.
 * - have been recently extracted (or their query text has changed)
 * - belong to newly created pages (or pages with modified context)
 *
 * Dirty queries must be re-ran.
 */
export function queriesReducer(
  state: IGatsbyState["queries"] = initialState(),
  action: ActionsUnion
): IGatsbyState["queries"] {
  switch (action.type) {
    case `DELETE_CACHE`:
      return initialState()

    case `CREATE_PAGE`: {
      const { path, componentPath } = action.payload
      if (!state.trackedQueries.has(path) || action.contextModified) {
        const query = registerQuery(state, path)
        query.dirty = setFlag(query.dirty, FLAG_DIRTY_PAGE)
      }
      registerComponent(state, componentPath).pages.add(path)
      return state
    }
    case `DELETE_PAGE`: {
      const { path, componentPath } = action.payload
      const component = state.trackedComponents.get(componentPath)
      if (component) {
        component.pages.delete(path)
      }
      state.trackedQueries.delete(path)
      return state
    }
    case `QUERY_EXTRACTED`: {
      // TODO: use hash instead of a query text
      const { componentPath, query } = action.payload
      const component = registerComponent(state, componentPath)
      if (component.query !== query) {
        // Invalidate all pages associated with a component when query text changes
        component.pages.forEach(queryId => {
          const query = state.trackedQueries.get(queryId)
          if (query) {
            query.dirty = setFlag(query.dirty, FLAG_DIRTY_TEXT)
          }
        })
        component.query = query
      }
      return state
    }
    case `QUERY_EXTRACTION_BABEL_ERROR`:
    case `QUERY_EXTRACTION_BABEL_SUCCESS`: {
      const { componentPath } = action.payload
      const component = registerComponent(state, componentPath)

      component.pages.forEach(queryId => {
        const query = state.trackedQueries.get(queryId)
        if (query) {
          const set = action.type === `QUERY_EXTRACTION_BABEL_ERROR`
          query.errors = setFlag(query.errors, FLAG_ERROR_BABEL, set)
          console.log(`Babel error for ${queryId}: `, set)
        }
      })
      return state
    }
    case `REPLACE_STATIC_QUERY`: {
      // Only called when static query text has changed, so no need to compare
      // TODO: unify the behavior?
      //   registerComponent(state, action.payload.componentPath)
      //     .staticQueries.add(action.payload.id)
      const query = registerQuery(state, action.payload.id)
      query.dirty = setFlag(query.dirty, FLAG_DIRTY_TEXT)
      return state
    }
    case `REMOVE_STATIC_QUERY`: {
      state.trackedQueries.delete(action.payload)
      return state
    }
    case `CREATE_COMPONENT_DEPENDENCY`: {
      const { path: queryId, nodeId, connection } = action.payload
      if (nodeId) {
        const queryIds = state.byNode.get(nodeId) ?? new Set<QueryId>()
        queryIds.add(queryId)
        state.byNode.set(nodeId, queryIds)
      }
      if (connection) {
        const queryIds =
          state.byConnection.get(connection) ?? new Set<QueryId>()
        queryIds.add(queryId)
        state.byConnection.set(connection, queryIds)
      }
      return state
    }
    case `QUERY_START`: {
      // Reset data dependencies as they will be updated when running the query
      const { path } = action.payload
      state.byNode.forEach(queryIds => {
        queryIds.delete(path)
      })
      state.byConnection.forEach(queryIds => {
        queryIds.delete(path)
      })
      return state
    }
    case `CREATE_NODE`:
    case `DELETE_NODE`: {
      const node = action.payload
      const queriesByNode = state.byNode.get(node.id) ?? []
      const queriesByConnection =
        state.byConnection.get(node.internal.type) ?? []

      queriesByNode.forEach(queryId => {
        const query = state.trackedQueries.get(queryId)
        if (query) {
          query.dirty = setFlag(query.dirty, FLAG_DIRTY_DATA)
        }
      })
      queriesByConnection.forEach(queryId => {
        const query = state.trackedQueries.get(queryId)
        if (query) {
          query.dirty = setFlag(query.dirty, FLAG_DIRTY_DATA)
        }
      })
      return state
    }
    case `PAGE_QUERY_RUN`: {
      const { path } = action.payload
      const query = registerQuery(state, path)
      console.log(`PAGE_QUERY_RUN`, path, query)
      query.dirty = 0
      return state
    }
    default:
      return state
  }
}

function setFlag(allFlags: number, flag: number, set = true): number {
  if (allFlags < 0) {
    allFlags = 0
  }
  return set ? allFlags | flag : allFlags & ~flag
}

export function hasFlag(allFlags: number, flag: number): boolean {
  return allFlags >= 0 && (allFlags & flag) > 0
}

function registerQuery(
  state: IGatsbyState["queries"],
  queryId: QueryId
): IQueryState {
  let query = state.trackedQueries.get(queryId)
  if (!query) {
    query = initialQueryState()
    state.trackedQueries.set(queryId, query)
  }
  return query
}

function registerComponent(
  state: IGatsbyState["queries"],
  componentPath: string
): IComponentState {
  let component = state.trackedComponents.get(componentPath)
  if (!component) {
    component = initialComponentState()
    component.componentPath = componentPath
    state.trackedComponents.set(componentPath, component)
  }
  return component
}
