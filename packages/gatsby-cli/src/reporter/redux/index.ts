import { createStore, combineReducers, Store } from "redux"
import { reducer } from "./reducer"
import { ActionsUnion, ISetLogs, IGatsbyCLIState } from "./types"
import { isInternalAction } from "./utils"
import { createStructuredLoggingDiagnosticsMiddleware } from "./diagnostics"
import { Actions } from "../constants"

let store: Store<{ logs: IGatsbyCLIState }> = createStore(
  combineReducers({
    logs: reducer,
  }),
  {}
)

const diagnosticsMiddleware = createStructuredLoggingDiagnosticsMiddleware(
  store
)

export type GatsbyCLIStore = typeof store
type StoreListener = (store: GatsbyCLIStore) => void
type ActionLogListener = (action: ActionsUnion) => any
type Thunk = (...args: Array<any>) => ActionsUnion

const storeSwapListeners: Array<StoreListener> = []
const onLogActionListeners = new Set<ActionLogListener>()

export const getStore = (): typeof store => store

export const dispatch = (action: ActionsUnion | Thunk): void => {
  if (!action) {
    return
  }

  if (Array.isArray(action)) {
    action.forEach(item => dispatch(item))
    return
  } else if (typeof action === `function`) {
    action(dispatch)
    return
  }

  action = {
    ...action,
    // @ts-ignore this is a typescript no-no..
    // And i'm pretty sure this timestamp isn't used anywhere.
    // but for now, the structured logs integration tests expect it
    // so it's easier to leave it and then explore as a follow up
    timestamp: new Date().toJSON(),
  } as ActionsUnion

  store.dispatch(action)

  diagnosticsMiddleware(action)

  if (isInternalAction(action)) {
    // consumers (ipc, yurnalist, json logger) shouldn't have to
    // deal with actions needed just for internal tracking of status
    return
  }
  for (const fn of onLogActionListeners) {
    fn(action)
  }
}

export const onStoreSwap = (fn: StoreListener): void => {
  storeSwapListeners.push(fn)
}

export const onLogAction = (fn: ActionLogListener): (() => void) => {
  onLogActionListeners.add(fn)

  return (): void => {
    onLogActionListeners.delete(fn)
  }
}

export const setStore = (s: GatsbyCLIStore): void => {
  s.dispatch({
    type: Actions.SetLogs,
    payload: store.getState().logs,
  } as ISetLogs)
  store = s
  storeSwapListeners.forEach(fn => fn(store))
}
