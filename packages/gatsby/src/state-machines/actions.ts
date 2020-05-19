import {
  assign,
  AnyEventObject,
  ActionFunction,
  AssignAction,
  spawn,
  DoneInvokeEvent,
  ActionFunctionMap,
} from "xstate"
import { Store } from "redux"
import { IBuildContext, IMutationAction } from "./develop"
import { actions } from "../redux/actions"
import path from "path"
import { write as writeAppData } from "../utils/app-data"
import { listenForMutations } from "../services/listen-for-mutations"
import { Span } from "opentracing"
import JestWorker from "jest-worker"

const concatUnique = <T>(array1?: T[], array2?: T[]): T[] =>
  Array.from(new Set((array1 || []).concat(array2 || [])))

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

export const assignChangedPages: BuildMachineAction = assign<
  IBuildContext,
  DoneInvokeEvent<{
    changedPages: string[]
    deletedPages: string[]
  }>
>((context, event) => {
  console.log({ event })
  return {
    pagesToBuild: concatUnique(context.pagesToBuild, event.data.changedPages),
    deletedPages: concatUnique(context.pagesToDelete, event.data.deletedPages),
  }
})

export const spawnMutationListener: BuildMachineAction = assign<IBuildContext>({
  mutationListener: () => spawn(listenForMutations, `listen-for-mutations`),
})

export const trackNewAndChangedPages: BuildMachineAction = assign(
  (_ctx, event) => {
    if (event.type === `CREATE_NODE` || event.type === `DELETE_NODE`) {
      console.log(`mutate`, event)
    }
    return {}
  }
)

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

export const writeCompilationHash: BuildMachineAction = async (
  { store, program },
  { stats }
) => {
  if (!store || !stats || !program) {
    return
  }
  const prevCompilationHash = store.getState().webpackCompilationHash

  if (stats.hash !== prevCompilationHash) {
    store.dispatch({
      type: `SET_WEBPACK_COMPILATION_HASH`,
      payload: stats.hash,
    })

    const publicDir = path.join(program.directory, `public`)
    await writeAppData(publicDir, stats.hash)
  }
}

export const assignBootstrap: BuildMachineAction = assign<
  IBuildContext,
  DoneInvokeEvent<{ store: Store; bootstrapSpan: Span; workerPool: JestWorker }>
>((_context, event) => {
  const { store, bootstrapSpan, workerPool } = event.data
  return {
    store,
    parentSpan: bootstrapSpan,
    workerPool,
  }
})

export const buildActions: ActionFunctionMap<IBuildContext, AnyEventObject> = {
  callApi,
  addNodeMutation,
  markFilesDirty,
  markNodesDirty,
  writeCompilationHash,
  spawnMutationListener,
  assignChangedPages,
  assignBootstrap,
}

// export const dummyActions = {
//     callApi,
//     addNodeMutation,
//     markFilesDirty,
//     markNodesDirty,
//   }
