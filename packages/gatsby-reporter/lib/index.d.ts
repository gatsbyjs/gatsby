import { reporter } from "./reporter";
import { setStore } from "./redux";
import { IGatsbyCLIState } from "./redux/types";
import { IActivityArgs, IPhantomReporter, IProgressReporter } from "./types";
export { reporter };
export { setStore };
export declare const reduxLogReducer: (state: IGatsbyCLIState | undefined, action: import("./redux/types").ActionsUnion) => IGatsbyCLIState;
export { IActivityArgs, IPhantomReporter, IProgressReporter, IGatsbyCLIState };
export declare type IGatsbyReporter = typeof reporter;
