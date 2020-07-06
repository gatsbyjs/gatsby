import {
  assign,
  AnyEventObject,
  ActionFunction,
  spawn,
  ActionFunctionMap,
  DoneEventObject,
} from "xstate"
import { Store } from "redux"
import { IBuildContext, IMutationAction } from "../services"
import { actions } from "../redux/actions"
import { listenForMutations } from "../services/listen-for-mutations"
import { DataLayerResult } from "./data-layer"
import { assertStore } from "../utils/assert-store"

export const callRealApi = async (
  event: IMutationAction,
  store?: Store
): Promise<unknown> => {
  assertStore(store)
  const { type, payload } = event
  if (type in actions) {
    store.dispatch(actions[type](...payload))
  }
  return null
}

/**
 * Handler for when we're inside handlers that should be able to mutate nodes
 */
export const callApi: ActionFunction<IBuildContext, AnyEventObject> = async (
  { store },
  event
): Promise<unknown> => callRealApi(event.payload, store)

/**
 * Event handler used in all states where we're not ready to process node
 * mutations. Instead we add it to a batch to process when we're next idle
 */
export const addNodeMutation = assign<IBuildContext, AnyEventObject>({
  nodeMutationBatch: ({ nodeMutationBatch = [] }, { payload }) => {
    // It's not pretty, but it's much quicker than concat
    nodeMutationBatch.push(payload)
    return nodeMutationBatch
  },
})

export const assignStoreAndWorkerPool = assign<IBuildContext, DoneEventObject>(
  (_context, event) => {
    const { store, workerPool } = event.data
    return {
      store,
      workerPool,
    }
  }
)

export const markQueryFilesDirty = assign<IBuildContext>({
  queryFilesDirty: true,
})

export const assignServiceResult = assign<IBuildContext, DoneEventObject>(
  (_context, { data }): DataLayerResult => data
)

export const spawnMutationListener = assign<IBuildContext>({
  mutationListener: () => spawn(listenForMutations, `listen-for-mutations`),
})

export const assignServers = assign<IBuildContext, AnyEventObject>(
  (_context, { data }) => {
    return {
      ...data,
      firstRun: false,
    }
  }
)

/**
 * Event handler used in all states where we're not ready to process a file change
 * Instead we add it to a batch to process when we're next idle
 */
// export const markFilesDirty: BuildMachineAction = assign<IBuildContext>({
//   filesDirty: true,
// })

export const markNodesDirty = assign<IBuildContext>({
  nodesMutatedDuringQueryRun: true,
})

export const buildActions: ActionFunctionMap<IBuildContext, AnyEventObject> = {
  callApi,
  markNodesDirty,
  addNodeMutation,
  spawnMutationListener,
  assignStoreAndWorkerPool,
  assignServiceResult,
  assignServers,
  markQueryFilesDirty,
}
