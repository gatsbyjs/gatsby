import {
  applyMiddleware,
  combineReducers,
  createStore,
  DeepPartial,
  Middleware,
  ReducersMapObject,
} from "redux"
import _ from "lodash"
import telemetry from "gatsby-telemetry"

import { mett } from "../utils/mett"
import thunk, { ThunkMiddleware, ThunkAction } from "redux-thunk"
import * as reducers from "./reducers"
import { writeToCache, readFromCache } from "./persist"
import { IGatsbyState, ActionsUnion, GatsbyStateKeys } from "./types"

const top = require(`process-top`)()

setInterval(function () {
  // Prints out a string containing stats about your Node.js process.
  console.log(
    `[${
      process.env.GATSBY_WORKER_ID
        ? `W#${process.env.GATSBY_WORKER_ID.padStart(2, `#`)}`
        : `Main`
    }] ${top.toString()}`
  )
}, 1000)

// Create event emitter for actions
export const emitter = mett()

// Read old node data from cache.
export const readState = (): IGatsbyState => {
  try {
    const state = readFromCache() as IGatsbyState
    if (state.nodes) {
      // re-create nodesByType
      state.nodesByType = new Map()
      state.nodes.forEach(node => {
        const { type } = node.internal
        if (!state.nodesByType.has(type)) {
          state.nodesByType.set(type, new Map())
        }
        // The `.has` and `.set` calls above make this safe
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        state.nodesByType.get(type)!.set(node.id, node)
      })
    }

    // jsonDataPaths was removed in the per-page-manifest
    // changes. Explicitly delete it here to cover case where user
    // runs gatsby the first time after upgrading.
    delete state[`jsonDataPaths`]
    telemetry.decorateEvent(`BUILD_END`, {
      cacheStatus: `WARM`,
    })
    telemetry.decorateEvent(`DEVELOP_STOP`, {
      cacheStatus: `WARM`,
    })
    return state
  } catch (e) {
    // ignore errors.
  }
  // BUG: Would this not cause downstream bugs? seems likely. Why wouldn't we just
  // throw and kill the program?
  telemetry.decorateEvent(`BUILD_END`, {
    cacheStatus: `COLD`,
  })
  telemetry.decorateEvent(`DEVELOP_STOP`, {
    cacheStatus: `COLD`,
  })
  return {} as IGatsbyState
}

export interface IMultiDispatch {
  <T extends ActionsUnion | ThunkAction<any, IGatsbyState, any, ActionsUnion>>(
    action: Array<T>
  ): Array<T>
}

/**
 * Redux middleware handling array of actions
 */
const multi: Middleware<IMultiDispatch> = ({ dispatch }) => next => (
  action: ActionsUnion
): ActionsUnion | Array<ActionsUnion> =>
  Array.isArray(action) ? action.filter(Boolean).map(dispatch) : next(action)

// We're using the inferred type here because manually typing it would be very complicated
// and error-prone. Instead we'll make use of the createStore return value, and export that type.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const configureStore = (initialState: IGatsbyState) =>
  createStore(
    combineReducers<IGatsbyState>({ ...reducers }),
    initialState,
    applyMiddleware(thunk as ThunkMiddleware<IGatsbyState, ActionsUnion>, multi)
  )

export type GatsbyReduxStore = ReturnType<typeof configureStore>
export const store: GatsbyReduxStore = configureStore(
  process.env.GATSBY_WORKER_POOL_WORKER ? ({} as IGatsbyState) : readState()
)

/**
 * Allows overloading some reducers (e.g. when setting a custom datastore)
 */
export function replaceReducer(
  customReducers: Partial<ReducersMapObject<IGatsbyState>>
): void {
  store.replaceReducer(
    combineReducers<IGatsbyState>({ ...reducers, ...customReducers })
  )
}

// Persist state.
export const saveState = (): void => {
  if (process.env.GATSBY_DISABLE_CACHE_PERSISTENCE) {
    // do not persist cache if above env var is set.
    // this is to temporarily unblock builds that hit the v8.serialize related
    // Node.js buffer size exceeding kMaxLength fatal crashes
    return undefined
  }

  const state = store.getState()

  return writeToCache({
    nodes: state.nodes,
    status: state.status,
    components: state.components,
    jobsV2: state.jobsV2,
    staticQueryComponents: state.staticQueryComponents,
    webpackCompilationHash: state.webpackCompilationHash,
    pageDataStats: state.pageDataStats,
    pages: state.pages,
    pendingPageDataWrites: state.pendingPageDataWrites,
    staticQueriesByTemplate: state.staticQueriesByTemplate,
    queries: state.queries,
    html: state.html,
  })
}

export const saveStateForWorkers = (slices: Array<GatsbyStateKeys>): void => {
  const state = store.getState()
  const contents = _.pick(state, slices)

  return writeToCache(contents, slices)
}

export const loadStateInWorker = (
  slices: Array<GatsbyStateKeys>
): DeepPartial<IGatsbyState> => {
  try {
    return readFromCache(slices) as DeepPartial<IGatsbyState>
  } catch (e) {
    // ignore errors.
  }
  return {} as IGatsbyState
}

store.subscribe(() => {
  const lastAction = store.getState().lastAction
  emitter.emit(lastAction.type, lastAction)
})
