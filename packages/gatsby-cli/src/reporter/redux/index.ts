import { createStore, combineReducers, type Store } from "redux";
import { reducer as logsReducer } from "./reducers/logs";
import { reducer as pageTreeReducer } from "./reducers/page-tree";
import type { ActionsUnion, ISetLogs, IGatsbyCLIState } from "./types";
import { isInternalAction } from "./utils";
import { createStructuredLoggingDiagnosticsMiddleware } from "./diagnostics";
import { Actions } from "../constants";
import type { IRenderPageArgs } from "../../reporter/types";

let store: Store<{ logs: IGatsbyCLIState; pageTree: IRenderPageArgs }> =
  createStore(
    combineReducers({
      logs: logsReducer,
      pageTree: pageTreeReducer,
    }),
    {},
  );

export type GatsbyCLIStore = typeof store;
type StoreListener = (store: GatsbyCLIStore) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActionLogListener = (action: ActionsUnion) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Thunk = (...args: Array<any>) => ActionsUnion;

const storeSwapListeners: Array<StoreListener> = [];
const onLogActionListeners = new Set<ActionLogListener>();

export const getStore = (): typeof store => store;

const diagnosticsMiddleware =
  createStructuredLoggingDiagnosticsMiddleware(getStore);

export function dispatch(action: ActionsUnion | Thunk): void {
  if (!action) {
    return;
  }

  if (Array.isArray(action)) {
    // @ts-ignore
    action.forEach((item) => dispatch(item));
    return;
  } else if (typeof action === "function") {
    action(dispatch);
    return;
  }

  action = {
    ...action,
    // @ts-ignore this is a typescript no-no..
    // And i'm pretty sure this timestamp isn't used anywhere.
    // but for now, the structured logs integration tests expect it
    // so it's easier to leave it and then explore as a follow up
    timestamp: new Date().toJSON(),
  } as ActionsUnion;

  store.dispatch(action);

  diagnosticsMiddleware(action);

  if (isInternalAction(action)) {
    // consumers (ipc, yurnalist, json logger) shouldn't have to
    // deal with actions needed just for internal tracking of status
    return;
  }
  for (const fn of onLogActionListeners) {
    fn(action);
  }
}

export function onStoreSwap(fn: StoreListener): void {
  storeSwapListeners.push(fn);
}

export function onLogAction(fn: ActionLogListener): () => void {
  onLogActionListeners.add(fn);

  return function (): void {
    onLogActionListeners.delete(fn);
  };
}

export function setStore(s: GatsbyCLIStore): void {
  s.dispatch({
    type: Actions.SetLogs,
    payload: store.getState().logs,
  } satisfies ISetLogs);

  store = s;
  storeSwapListeners.forEach((fn) => fn(store));
}
