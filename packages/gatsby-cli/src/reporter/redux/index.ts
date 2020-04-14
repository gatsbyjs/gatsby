import { createStore, combineReducers } from "redux"
import { reducer } from "./reducer"
import { ActionsUnion, ISetLogs } from "./types"
import { isInternalAction } from "./utils"
import { Actions } from "../constants"

let store = createStore(
  combineReducers({
    logs: reducer,
  }),
  {}
)

type GatsbyCLIStore = typeof store
type StoreListener = (store: GatsbyCLIStore) => void
type ActionLogListener = (action: ActionsUnion) => any
type Thunk = (...args: any[]) => ActionsUnion

const storeSwapListeners: StoreListener[] = []
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

  store.dispatch(action)

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
