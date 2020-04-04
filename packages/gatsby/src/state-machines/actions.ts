import { Store } from "../.."
import { assign, AnyEventObject, ActionFunction, AssignAction } from "xstate"
import { IBuildContext, IMutationAction } from "./develop"
import { actions } from "../redux/actions"

export const callRealApi = async (
  event: IMutationAction,
  store?: Store
): Promise<unknown> => {
  if (!store) {
    console.error(`No store`)
    return null
  }
  const { type, payload } = event
  if (type in actions) {
    return actions[type](...payload)(store.dispatch.bind(store))
  }
  return null
}

type BuildMachineAction =
  | ActionFunction<IBuildContext, AnyEventObject>
  | AssignAction<IBuildContext, AnyEventObject>

/**
 * Handler for when we're inside handlers that should be able to mutate nodes
 */
export const callApi: BuildMachineAction = async (
  ctx,
  event
): Promise<unknown> => callRealApi(event.payload, ctx.store)

/**
 * Event handler used in all states where we're not ready to process node
 * mutations. Instead we add it to a batch to process when we're next idle
 */
export const addNodeMutation: BuildMachineAction = assign((ctx, event) => {
  return {
    nodeMutationBatch: ctx.nodeMutationBatch.concat([event.payload]),
  }
})

/**
 * Event handler used in all states where we're not ready to process a file change
 * Instead we add it to a batch to process when we're next idle
 */
export const markFilesDirty: BuildMachineAction = assign<IBuildContext>({
  filesDirty: true,
})

export const markNodesDirty: BuildMachineAction = assign<IBuildContext>({
  nodesMutatedDuringQueryRun: true,
})

export const machineActions = {
  callApi,
  addNodeMutation,
  markFilesDirty,
  markNodesDirty,
}

// export const dummyActions = {
//     callApi,
//     addNodeMutation,
//     markFilesDirty,
//     markNodesDirty,
//   }
