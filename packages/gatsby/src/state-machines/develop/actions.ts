import {
  assign,
  AnyEventObject,
  ActionFunction,
  spawn,
  DoneEventObject,
} from "xstate"
import { IBuildContext } from "../../services"
import { actions } from "../../redux/actions"
import { listenForMutations } from "../../services/listen-for-mutations"
import { DataLayerResult } from "../data-layer"
import { saveState } from "../../redux/save-state"
import reporter from "gatsby-cli/lib/reporter"
import { store } from "../../redux"
import { ProgramStatus } from "../../redux/types"
import { createWebpackWatcher } from "../../services/listen-to-webpack"
import { callRealApi } from "../../utils/call-deferred-api"
import {
  writeGraphQLFragments,
  writeGraphQLSchema,
} from "../../utils/graphql-typegen/file-writes"
import { writeTypeScriptTypes } from "../../utils/graphql-typegen/ts-codegen"
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
  store.dispatch(
    actions.setProgramStatus(ProgramStatus.BOOTSTRAP_QUERY_RUNNING_FINISHED)
  )
}

export const markQueryFilesDirty = assign<IBuildContext>({
  queryFilesDirty: true,
})

export const markSourceFilesDirty = assign<IBuildContext, AnyEventObject>(
  (context, event) => {
    const prev = context.changedSourceFiles ?? new Set()
    return {
      sourceFilesDirty: true,
      changedSourceFiles: prev.add(event.payload ?? event.file),
    }
  }
)

export const markSourceFilesClean = assign<IBuildContext>({
  sourceFilesDirty: false,
  changedSourceFiles: () => new Set(),
})

export const setRecompiledFiles = assign<IBuildContext, AnyEventObject>(
  context => {
    return {
      recompiledFiles: context.changedSourceFiles,
    }
  }
)

export const markNodesDirty = assign<IBuildContext>({
  nodesMutatedDuringQueryRun: true,
})

export const markNodesClean = assign<IBuildContext>({
  nodesMutatedDuringQueryRun: false,
})

export const incrementRecompileCount = assign<IBuildContext>({
  nodesMutatedDuringQueryRunRecompileCount: ({
    nodesMutatedDuringQueryRunRecompileCount: count = 0,
  }) => {
    reporter.verbose(
      `Re-running queries because nodes mutated during query run. Count: ${
        count + 1
      }`
    )
    return count + 1
  },
})

export const resetRecompileCount = assign<IBuildContext>({
  nodesMutatedDuringQueryRunRecompileCount: 0,
  nodesMutatedDuringQueryRun: false,
})

export const assignServiceResult = assign<IBuildContext, DoneEventObject>(
  (_context, { data }): DataLayerResult => data
)

/**
 * This spawns the service that listens to the `emitter` for various mutation events
 */
export const spawnMutationListener = assign<IBuildContext>({
  // @ts-ignore - TODO: Fixing this seems more involved: https://xstate.js.org/docs/guides/typescript.html#troubleshooting & https://github.com/statelyai/xstate/issues/2664
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
  // @ts-ignore - TODO: Fixing this seems more involved: https://xstate.js.org/docs/guides/typescript.html#troubleshooting & https://github.com/statelyai/xstate/issues/2664
  webpackListener: ({ compiler }) => {
    if (!compiler) {
      return undefined
    }
    return spawn(createWebpackWatcher(compiler))
  },
})

export const assignWebhookBody = assign<IBuildContext, AnyEventObject>({
  webhookBody: (_context, { payload }) => payload?.webhookBody,
  webhookSourcePluginName: (_context, { payload }) => payload?.pluginName,
})

export const clearWebhookBody = assign<IBuildContext, AnyEventObject>({
  webhookBody: undefined,
  webhookSourcePluginName: undefined,
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

export const panicBecauseOfInfiniteLoop: ActionFunction<
  IBuildContext,
  AnyEventObject
> = () => {
  reporter.panic(
    reporter.stripIndent(`
  Panicking because nodes appear to be being changed every time we run queries. This would cause the site to recompile infinitely.
  Check custom resolvers to see if they are unconditionally creating or mutating nodes on every query.
  This may happen if they create nodes with a field that is different every time, such as a timestamp or unique id.`)
  )
}

export const trackRequestedQueryRun = assign<IBuildContext, AnyEventObject>({
  pendingQueryRuns: (context, { payload }) => {
    const pendingQueryRuns = context.pendingQueryRuns || new Set<string>()
    if (payload?.pagePath) {
      pendingQueryRuns.add(payload.pagePath)
    }
    return pendingQueryRuns
  },
})

export const clearPendingQueryRuns = assign<IBuildContext>(() => {
  return {
    pendingQueryRuns: new Set<string>(),
  }
})

export const schemaTypegen: ActionFunction<
  IBuildContext,
  AnyEventObject
> = async (context, event) => {
  const schema = event.payload.payload
  const directory = context.program.directory

  context.reporter!.verbose(`Re-Generating schema.graphql`)

  try {
    await writeGraphQLSchema(directory, schema)
  } catch (err) {
    context.reporter!.panicOnBuild({
      id: `12100`,
      context: {
        sourceMessage: err,
      },
    })
  }
}

export const definitionsTypegen: ActionFunction<
  IBuildContext,
  AnyEventObject
> = async (context, event) => {
  const definitions = event.payload.payload
  const { schema, config } = context.store!.getState()
  const directory = context.program.directory
  const graphqlTypegenOptions = config.graphqlTypegen

  if (!graphqlTypegenOptions) {
    throw new Error(`graphqlTypegen option is falsy. This should never happen.`)
  }

  context.reporter!.verbose(`Re-Generating fragments.graphql & TS Types`)

  try {
    await writeGraphQLFragments(directory, definitions)
    await writeTypeScriptTypes(
      directory,
      schema,
      definitions,
      graphqlTypegenOptions
    )
  } catch (err) {
    context.reporter!.panicOnBuild({
      id: `12100`,
      context: {
        sourceMessage: err,
      },
    })
  }
}

export const buildActions = {
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
  setRecompiledFiles,
  markNodesClean,
  incrementRecompileCount,
  resetRecompileCount,
  panicBecauseOfInfiniteLoop,
  saveDbState,
  setQueryRunningFinished,
  panic,
  logError,
  trackRequestedQueryRun,
  clearPendingQueryRuns,
  schemaTypegen,
  definitionsTypegen,
}
