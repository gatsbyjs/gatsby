import {
  applyMiddleware,
  combineReducers,
  createStore,
  // Middleware,
  ReducersMapObject,
  Store,
} from "redux"
// eslint-disable-next-line @typescript-eslint/naming-convention
import _ from "lodash"
// @ts-ignore
import telemetry from "gatsby-telemetry"

import { mett } from "../utils/mett"
import thunk, { ThunkAction, ThunkDispatch } from "redux-thunk"
import * as rawReducers from "./reducers"
import { writeToCache, readFromCache } from "./persist"
import type { IGatsbyState, ActionsUnion, GatsbyStateKeys } from "./types"

const persistedReduxKeys = [
  `nodes`,
  `typeOwners`,
  `statefulSourcePlugins`,
  `status`,
  `components`,
  `jobsV2`,
  `staticQueryComponents`,
  `webpackCompilationHash`,
  `pageDataStats`,
  `pages`,
  `staticQueriesByTemplate`,
  `pendingPageDataWrites`,
  `queries`,
  `html`,
  `slices`,
  `slicesByTemplate`,
]

const reducers = persistedReduxKeys.reduce((acc, key) => {
  const rawReducer = rawReducers[key]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  acc[key] = function (state, action): any {
    if (action.type === `RESTORE_CACHE` && action.payload[key]) {
      return action.payload[key]
    } else {
      return rawReducer(state, action)
    }
  }

  return acc
}, rawReducers)

// Create event emitter for actions
export const emitter = mett()

// Read old node data from cache.
export function readState(): IGatsbyState {
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

    telemetry.trackCli(`CACHE_STATUS`, {
      cacheStatus: `WARM`,
    })

    return state
  } catch (e) {
    telemetry.trackCli(`CACHE_STATUS`, {
      cacheStatus: `COLD`,
    })

    return {} as IGatsbyState
  }
}

export type IMultiDispatch = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <T extends ActionsUnion | ThunkAction<any, IGatsbyState, any, ActionsUnion>>(
    action: Array<T>,
  ): Array<T>
}

/**
 * Redux middleware handling array of actions
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function multi({ dispatch }): (next: any) => (action: any) => any {
  return next => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (action): any => {
      return Array.isArray(action)
        ? action.filter(Boolean).map(dispatch)
        : next(action)
    }
  }
}

export type GatsbyReduxStore = Store<IGatsbyState> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: ThunkDispatch<IGatsbyState, any, ActionsUnion> & IMultiDispatch
}

export function configureStore(initialState: IGatsbyState): GatsbyReduxStore {
  // @ts-ignore
  const store = createStore(
    // @ts-ignore
    combineReducers<IGatsbyState>(reducers),
    // @ts-ignore
    initialState,
    // @ts-ignore
    applyMiddleware(thunk, multi),
  )

  store.dispatch({
    type: `INIT`,
  })

  // @ts-ignore
  return store
}

export const store: GatsbyReduxStore = configureStore(
  process.env.GATSBY_WORKER_POOL_WORKER ? ({} as IGatsbyState) : readState(),
)

/**
 * Allows overloading some reducers (e.g. when setting a custom datastore)
 */
export function replaceReducer(
  customReducers: Partial<ReducersMapObject<IGatsbyState>>,
): void {
  store.replaceReducer(
    // @ts-ignore
    combineReducers<IGatsbyState>({ ...reducers, ...customReducers }),
  )
}

// Persist state.
export function saveState(): void {
  if (process.env.GATSBY_DISABLE_CACHE_PERSISTENCE) {
    // do not persist cache if above env var is set.
    // this is to temporarily unblock builds that hit the v8.serialize related
    // Node.js buffer size exceeding kMaxLength fatal crashes
    return undefined
  }

  const state = store.getState()

  const sliceOfStateToPersist = _.pick(state, persistedReduxKeys)

  return writeToCache(sliceOfStateToPersist)
}

export function savePartialStateToDisk(
  slices: Array<GatsbyStateKeys>,
  optionalPrefix?: string | undefined,
  transformState?: (<T extends IGatsbyState>(state: T) => T) | undefined,
): void {
  const state = store.getState()
  const contents = _.pick(state, slices)
  const savedContents = transformState ? transformState(contents) : contents

  return writeToCache(savedContents, slices, optionalPrefix)
}

export function loadPartialStateFromDisk(
  slices: Array<GatsbyStateKeys>,
  optionalPrefix?: string,
): IGatsbyState {
  try {
    return readFromCache(slices, optionalPrefix) as IGatsbyState
  } catch (e) {
    // ignore errors.
  }
  return {} as IGatsbyState
}

store.subscribe(() => {
  const lastAction = store.getState().lastAction
  emitter.emit(lastAction.type, lastAction)
})
