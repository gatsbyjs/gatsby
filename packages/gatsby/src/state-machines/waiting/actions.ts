import { AssignAction, assign, ActionFunctionMap } from "xstate"
import { IWaitingContext } from "./types"
import { AnyAction } from "redux"

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

export const waitingActions: ActionFunctionMap<IWaitingContext, AnyAction> = {
  addNodeMutation,
}
