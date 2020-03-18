import {
  applyMiddleware,
  combineReducers,
  createStore,
  Store,
  Middleware,
} from "redux"
import _ from "lodash"

import mitt from "mitt"
import thunk from "redux-thunk"
import reducers from "./reducers"
import { writeToCache, readFromCache } from "./persist"
import { IReduxState, ActionsUnion } from "./types"

// Create event emitter for actions
export const emitter = mitt()

// Read old node data from cache.
export const readState = (): IReduxState => {
  try {
    const state = readFromCache() as IReduxState
    if (state.nodes) {
      // re-create nodesByType
      state.nodesByType = new Map()
      state.nodes.forEach(node => {
        const { type } = node.internal
        if (!state.nodesByType!.has(type)) {
          state.nodesByType!.set(type, new Map())
        }
        state.nodesByType!.get(type).set(node.id, node)
      })
    }

    // jsonDataPaths was removed in the per-page-manifest
    // changes. Explicitly delete it here to cover case where user
    // runs gatsby the first time after upgrading.
    delete state[`jsonDataPaths`]
    return state
  } catch (e) {
    // ignore errors.
  }
  // BUG: Would this not cause downstream bugs? seems likely. Why wouldn't we just
  // throw and kill the program?
  return {} as IReduxState
}

/**
 * Redux middleware handling array of actions
 */
const multi: Middleware = ({ dispatch }) => next => (
  action: ActionsUnion
): ActionsUnion | ActionsUnion[] =>
  Array.isArray(action) ? action.filter(Boolean).map(dispatch) : next(action)

export const configureStore = (initialState: IReduxState): Store<IReduxState> =>
  createStore(
    combineReducers<IReduxState>({ ...reducers }),
    initialState,
    applyMiddleware(thunk, multi)
  )

export const store = configureStore(readState())

// Persist state.
export const saveState = (): void => {
  const state = store.getState()

  return writeToCache({
    nodes: state.nodes,
    status: state.status,
    componentDataDependencies: state.componentDataDependencies,
    components: state.components,
    jobsV2: state.jobsV2,
    staticQueryComponents: state.staticQueryComponents,
    webpackCompilationHash: state.webpackCompilationHash,
    pageDataStats: state.pageDataStats,
    pageData: state.pageData,
  })
}

store.subscribe(() => {
  const lastAction = store.getState().lastAction
  emitter.emit(lastAction.type, lastAction)
})
