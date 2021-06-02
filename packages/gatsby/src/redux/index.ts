import {
  applyMiddleware,
  combineReducers,
  createStore,
  Middleware,
  ReducersMapObject,
} from "redux"
import _ from "lodash"
import telemetry from "gatsby-telemetry"
import onExit from "signal-exit"

import { mett } from "../utils/mett"
import thunk, { ThunkMiddleware } from "redux-thunk"
import * as reducers from "./reducers"
import { writeToCache, readFromCache } from "./persist"
import { IGatsbyState, ActionsUnion } from "./types"
import { forwardToMain } from "../utils/worker/shared-db"
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
  <T extends ActionsUnion>(action: Array<T>): Array<T>
}

/**
 * Redux middleware handling array of actions
 */
const multi: Middleware<IMultiDispatch> = ({ dispatch }) => next => (
  action: ActionsUnion
): ActionsUnion | Array<ActionsUnion> =>
  Array.isArray(action) ? action.filter(Boolean).map(dispatch) : next(action)

// We're using the inferred type here becauise manually typing it would be very complicated
// and error-prone. Instead we'll make use of the createStore return value, and export that type.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const configureStore = (initialState: IGatsbyState) => {
  const middleware = [
    thunk as ThunkMiddleware<IGatsbyState, ActionsUnion>,
    multi,
  ]

  if (process.env.JEST_WORKER_ID) {
    const unknown = new Set()
    const allowedInWorker = new Set([
      `SET_INFERENCE_METADATA`, // new (to hydrate inference metadata)
      `SET_SCHEMA`,
      `SET_SCHEMA_COMPOSER`,
      `SET_EXTRACTED_QUERIES`, // new (to hydrate components and staticQueryComponents)
      `SET_PROGRAM`,
      `SET_SITE_CONFIG`,
      `SET_SITE_FLATTENED_PLUGINS`,
      `CREATE_TYPES`,
      `SET_RESOLVED_NODES`, // we wouldn't want it eventually - this is just for the spike
    ])

    const actionsToForward = new Set([
      `QUERY_START`,
      `CREATE_COMPONENT_DEPENDENCY`,
      `ADD_PENDING_PAGE_DATA_WRITE`,
      `PAGE_QUERY_RUN`,
    ])

    const notAllowed = new Set([`CREATE_JOB_V2`, `END_JOB_V2`])
    // insert forwarding middleware
    middleware.splice(1, 0, _ => next => (action: ActionsUnion):
      | ActionsUnion
      | void
      | Promise<void> => {
      if (allowedInWorker.has(action.type)) {
        return next(action)
      } else if (actionsToForward.has(action.type)) {
        return forwardToMain(action)
      } else if (notAllowed.has(action.type)) {
        // throw new Error(`Action "${action.type}" not allowed in worker`)
      } else {
        unknown.add(action.type)
        return Promise.resolve() // just so we don't crash on `createJobV2` for now as caller expect promise
      }
    })

    onExit(() => {
      console.log(`unknown actions`, unknown)
    })
  }

  return createStore(
    combineReducers<IGatsbyState>({ ...reducers }),
    initialState,
    applyMiddleware(...middleware)
  )
}

export type GatsbyReduxStore = ReturnType<typeof configureStore>
export const store: GatsbyReduxStore = configureStore(readState())

/**
 * Allows overloading some reducers (e.g. when setting a custom datastore)
 */
export function replaceReducer(
  customReducers: Partial<ReducersMapObject<IGatsbyState>>
): void {
  store.replaceReducer(combineReducers({ ...reducers, ...customReducers }))
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

store.subscribe(() => {
  const lastAction = store.getState().lastAction
  emitter.emit(lastAction.type, lastAction)
})
