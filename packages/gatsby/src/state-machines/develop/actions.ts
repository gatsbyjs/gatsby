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
import { actions, boundActionCreators } from "../../redux/actions"
import { listenForMutations } from "../../services/listen-for-mutations"
import { DataLayerResult } from "../data-layer"
import { assertStore } from "../../utils/assert-store"
import { saveState } from "../../db"
import reporter from "gatsby-cli/lib/reporter"
import { ProgramStatus } from "../../redux/types"
import { createWebpackWatcher } from "../../services/listen-to-webpack"

/**
 * These are the deferred redux actions sent from api-runner-node
 * They may include a `resolve` prop (if they are createNode actions).
 * If so, we resolve the promise when we're done
 */
export const callRealApi = (event: IMutationAction, store?: Store): void => {
  assertStore(store)
  const { type, payload, resolve } = event
  if (type in actions) {
    // If this is a createNode action then this will be a thunk.
    // No worries, we just dispatch it like any other
    const action = actions[type](...payload)
    const result = store.dispatch(action)
    // Somebody may be waiting for this
    if (resolve) {
      resolve(result)
    }
  } else {
    reporter.log(`Could not dispatch unknown action "${type}`)
  }
}

/**
 * Handler for when we're inside handlers that should be able to mutate nodes
 * Instead of queueing, we call it right away
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

const setQueryRunningFinished = async (): Promise<void> => {
  boundActionCreators.setProgramStatus(
    ProgramStatus.BOOTSTRAP_QUERY_RUNNING_FINISHED
  )
}

export const markQueryFilesDirty = assign<IBuildContext>({
  queryFilesDirty: true,
})

export const markSourceFilesDirty = assign<IBuildContext>({
  sourceFilesDirty: true,
})

export const markSourceFilesClean = assign<IBuildContext>({
  sourceFilesDirty: false,
})

export const assignServiceResult = assign<IBuildContext, DoneEventObject>(
  (_context, { data }): DataLayerResult => data
)

/**
 * This spawns the service that listens to the `emitter` for various mutation events
 */
export const spawnMutationListener = assign<IBuildContext>({
  mutationListener: () => spawn(listenForMutations, `listen-for-mutations`),
})

export const assignServers = assign<IBuildContext, AnyEventObject>(
  (_context, { data }) => {
    return {
      ...data,
    }
  }
)

export const spawnWebpackListener = assign<IBuildContext, AnyEventObject>({
  webpackListener: ({ compiler }) => {
    if (!compiler) {
      return undefined
    }
    return spawn(createWebpackWatcher(compiler))
  },
})

export const assignWebhookBody = assign<IBuildContext, AnyEventObject>({
  webhookBody: (_context, { payload }) => payload?.webhookBody,
})

export const clearWebhookBody = assign<IBuildContext, AnyEventObject>({
  webhookBody: undefined,
})

export const finishParentSpan = ({ parentSpan }: IBuildContext): void =>
  parentSpan?.finish()

export const saveDbState = (): Promise<void> => saveState()

export const logError: ActionFunction<IBuildContext, AnyEventObject> = (
  _context,
  event
) => {
  reporter.error(event.data)
}

export const panic: ActionFunction<IBuildContext, AnyEventObject> = (
  _context,
  event
) => {
  reporter.panic(event.data)
}

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
  spawnWebpackListener,
  markSourceFilesDirty,
  markSourceFilesClean,
  saveDbState,
  setQueryRunningFinished,
  panic,
  logError,
}
