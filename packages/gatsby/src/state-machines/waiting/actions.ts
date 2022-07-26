import {
  AssignAction,
  assign,
  ActionFunctionMap,
  sendParent,
  AnyEventObject,
  ActionFunction,
} from "xstate"
import { IWaitingContext } from "./types"
import { AnyAction } from "redux"
import { callRealApi } from "../../utils/call-deferred-api"

export const callApi: ActionFunction<IWaitingContext, AnyEventObject> = (
  { store },
  event
) => callRealApi(event.payload, store)

/**
 * Event handler used when we're not ready to process node mutations.
 * Instead we add it to a batch to process when we're next idle
 */
export const addNodeMutation: AssignAction<IWaitingContext, AnyAction> = assign(
  {
    nodeMutationBatch: ({ nodeMutationBatch = [] }, { payload }) => {
      // It's not pretty, but it's much quicker than concat
      nodeMutationBatch.push(payload)
      return nodeMutationBatch
    },
  }
)

export const extractQueries = sendParent<IWaitingContext, AnyEventObject>(
  `EXTRACT_QUERIES_NOW`
)

export const waitingActions: ActionFunctionMap<IWaitingContext, AnyAction> = {
  addNodeMutation,
  extractQueries,
  callApi,
}
