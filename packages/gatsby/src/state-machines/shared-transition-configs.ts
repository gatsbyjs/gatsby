import { Store } from "../.."
import { assign, TransitionConfig, AnyEventObject } from "xstate"
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

/**
 * Handler for when we're inside handlers that should be able to mutate nodes
 */
export const skipDeferredApi: TransitionConfig<
  IBuildContext,
  AnyEventObject
> = {
  actions: [
    async (ctx, event): Promise<unknown> =>
      callRealApi(event.payload, ctx.store),
  ],
}

/**
 * Event handler used in all states where we're not ready to process node
 * mutations. Instead we add it to a batch to process when we're next idle
 */
export const ADD_NODE_MUTATION: TransitionConfig<
  IBuildContext,
  AnyEventObject
> = {
  actions: assign((ctx, event) => {
    return {
      nodeMutationBatch: [...ctx.nodeMutationBatch, event.payload],
    }
  }),
}

/**
 * Event handler used in all states where we're not ready to process a file change
 * Instead we add it to a batch to process when we're next idle
 */
export const SOURCE_FILE_CHANGED: TransitionConfig<
  IBuildContext,
  AnyEventObject
> = {
  actions: assign<IBuildContext>(() => {
    return {
      filesDirty: true,
    }
  }),
}

/**
 * When running queries we might add nodes (e.g from resolvers). If so we'll
 * want to re-run queries and schema inference
 */
export const runMutationAndMarkDirty: TransitionConfig<
  IBuildContext,
  AnyEventObject
> = {
  actions: [
    assign<IBuildContext, AnyEventObject>({
      nodesMutatedDuringQueryRun: true,
    }),
    async (ctx, event): Promise<unknown> =>
      callRealApi(event.payload, ctx.store),
  ],
}
