import {
  type AssignAction,
  assign,
  type ActionFunctionMap,
  sendParent,
  type AnyEventObject,
  type ActionFunction,
} from "xstate";
import type { IWaitingContext } from "./types";
import type { AnyAction } from "redux";
import { callRealApi } from "../../utils/call-deferred-api";

export const callApi: ActionFunction<IWaitingContext, AnyEventObject> =
  function callApi({ store }, event): void {
    return callRealApi(event.payload, store);
  };

/**
 * Event handler used when we're not ready to process node mutations.
 * Instead we add it to a batch to process when we're next idle
 */
export const addNodeMutation: AssignAction<IWaitingContext, AnyAction> = assign(
  {
    nodeMutationBatch: ({ nodeMutationBatch = [] }, { payload }) => {
      // It's not pretty, but it's much quicker than concat
      nodeMutationBatch.push(payload);
      return nodeMutationBatch;
    },
  },
);

export const extractQueries = sendParent<IWaitingContext, AnyEventObject>(
  "EXTRACT_QUERIES_NOW",
);

export const waitingActions: ActionFunctionMap<IWaitingContext, AnyAction> = {
  addNodeMutation,
  extractQueries,
  callApi,
};
