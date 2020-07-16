import {
  assign,
  AnyEventObject,
  ActionFunction,
  spawn,
  ActionFunctionMap,
  DoneEventObject,
} from "xstate"
import { Store } from "redux"
import { IBuildContext, IMutationAction } from "../../services"
import { actions } from "../../redux/actions"
import { listenForMutations } from "../../services/listen-for-mutations"
import { DataLayerResult } from "../data-layer"
import { assertStore } from "../../utils/assert-store"
import reporter from "gatsby-cli/lib/reporter"

export const callRealApi = (event: IMutationAction, store?: Store): void => {
  assertStore(store)
  const { type, payload, resolve } = event
  if (type in actions) {
    const action = actions[type](...payload)
    const result = store.dispatch(action)
    if (resolve) {
      resolve(result)
    }
  } else {
    reporter.log(`Could not dispatch unknown action "${type}`)
  }
}

/**
 * Handler for when we're inside handlers that should be able to mutate nodes
 */
export const callApi: ActionFunction<IBuildContext, AnyEventObject> = (
  { store },
  event
) => callRealApi(event.payload, store)

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

export const assignWebhookBody = assign<IBuildContext, AnyEventObject>({
  webhookBody: (_context, { payload }) => payload?.webhookBody,
})

export const clearWebhookBody = assign<IBuildContext, AnyEventObject>({
  webhookBody: undefined,
})

export const finishParentSpan = ({ parentSpan }: IBuildContext): void =>
  parentSpan?.finish()

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
  assignWebhookBody,
  clearWebhookBody,
  finishParentSpan,
}
