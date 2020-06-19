import { ActionsUnion } from "./types";
declare let store: import("redux").Store<import("redux").CombinedState<{
    logs: import("./types").IGatsbyCLIState;
}>, ActionsUnion>;
declare type GatsbyCLIStore = typeof store;
declare type StoreListener = (store: GatsbyCLIStore) => void;
declare type ActionLogListener = (action: ActionsUnion) => any;
declare type Thunk = (...args: any[]) => ActionsUnion;
export declare const getStore: () => typeof store;
export declare const dispatch: (action: ActionsUnion | Thunk) => void;
export declare const onStoreSwap: (fn: StoreListener) => void;
export declare const onLogAction: (fn: ActionLogListener) => (() => void);
export declare const setStore: (s: GatsbyCLIStore) => void;
export {};
