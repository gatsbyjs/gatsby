import { createStore, combineReducers } from "redux"
import { reducer } from "./reducer"
import { ActionsUnion } from "./types"
import { isInternalAction } from "./utils"
import { setLogs } from "./actions"

let store = createStore(
  combineReducers({
    logs: reducer,
  }),
  {}
)

type GatsbyCLIStore = typeof store
type StoreListener = (store: GatsbyCLIStore) => void
type ActionLogListener = (action: ActionsUnion) => any

const storeSwapListeners: StoreListener[] = []
const onLogActionListeners = new Set<ActionLogListener>()

export const getStore = () => store

export const dispatch = (action: ActionsUnion): void => {
  if (!action) {
    return
  }

  if (Array.isArray(action)) {
    action.forEach(item => dispatch(item))
    return
  } else if (typeof action === `function`) {
    store.dispatch(action)
    return
  }

  action = {
    ...action,
    // @ts-ignore This is a classic javascript thing that is a no-no with Typescript
    //            I'm not sure the best way to fix this, but we should probably just put this in
    //            every action definition.
    timestamp: new Date().toJSON(),
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

export const onStoreSwap = (fn: StoreListener) => {
  storeSwapListeners.push(fn)
}

export const onLogAction = (fn: ActionLogListener) => {
  onLogActionListeners.add(fn)

  return (): void => {
    onLogActionListeners.delete(fn)
  }
}

export const setStore = (s: GatsbyCLIStore) => {
  setLogs(store.getState().logs)
  store = s
  storeSwapListeners.forEach(fn => fn(store))
}
