import {
  Machine,
  assign,
  DoneInvokeEvent,
  TransitionConfig,
  AnyEventObject,
} from "xstate"

import { initialize } from "../services/initialize"

import { startWebpackServer } from "../services/start-webpack-server"
import { WebsocketManager } from "../utils/websocket-manager"
import { Store } from "../.."
import { actions } from "../redux/actions"
import { Compiler } from "webpack"
import { dataLayerStates } from "./data-layer"
import { Span } from "opentracing"
import GraphQLRunner from "../query/graphql-runner"
import { queryStates } from "./queries"
import { idleStates } from "./waiting"

export interface IBuildContext {
  recursionCount: number
  nodesMutatedDuringQueryRun: boolean
  firstRun: boolean
  nodeMutationBatch: any[]
  filesDirty?: boolean
  runningBatch: any[]
  compiler?: Compiler
  websocketManager?: WebsocketManager
  store?: Store
  parentSpan?: Span
  graphqlRunner?: GraphQLRunner
  refresh?: boolean
  webhookBody?: Record<string, any>
  queryIds?: { staticQueryIds: string[]; pageQueryIds: string[] }
}

export const callRealApi = async (event, store?: Store): Promise<any> => {
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

const context: IBuildContext = {
  recursionCount: 0,
  nodesMutatedDuringQueryRun: false,
  firstRun: true,
  nodeMutationBatch: [],
  runningBatch: [],
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
  actions: assign((ctx, event) => {
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
    assign<any, DoneInvokeEvent<any>>({
      nodesMutatedDuringQueryRun: true,
    }),
    async (ctx, event): Promise<void> =>
      // console.log(`calling real api and mareking dirty`)
      callRealApi(event.payload, ctx.store),
  ],
}

/**
 * Handler for when we're inside handlers that should be able to mutate nodes
 */
const skipDeferredApi: TransitionConfig<IBuildContext, AnyEventObject> = {
  actions: [
    async (ctx, event): Promise<void> => callRealApi(event.payload, ctx.store),
  ],
}

// eslint-disable-next-line new-cap
export const developMachine = Machine<any>({
  id: `build`,
  initial: `initializing`,
  context,
  states: {
    initializing: {
      on: { ADD_NODE_MUTATION: skipDeferredApi },
      invoke: {
        src: initialize,
        onDone: {
          target: `initializingDataLayer`,
          actions: assign<any, DoneInvokeEvent<any>>((context, event) => {
            const { store, bootstrapSpan } = event.data
            return {
              store,
              parentSpan: bootstrapSpan,
            }
          }),
        },
        onError: {
          target: `failed`,
        },
      },
    },
    initializingDataLayer: {
      on: { ADD_NODE_MUTATION: skipDeferredApi },
      ...dataLayerStates,
    },
    extractingAndRunningQueries: {
      on: {
        ADD_NODE_MUTATION,
        SOURCE_FILE_CHANGED,
      },
      ...queryStates,
    },

    runningWebpack: {
      on: {
        ADD_NODE_MUTATION,
        SOURCE_FILE_CHANGED,
      },
      invoke: {
        src: startWebpackServer,
        id: `running-webpack`,
        onDone: {
          target: `waiting`,
          actions: assign((context, { data }) => {
            const { compiler, websocketManager } = data
            return {
              compiler,
              firstRun: false,
              websocketManager,
            }
          }),
        },
        onError: {
          target: `failed`,
        },
      },
    },

    waiting: {
      on: { ADD_NODE_MUTATION },
      ...idleStates,
    },

    failed: {
      invoke: {
        src: async (_context: IBuildContext, event): Promise<void> => {
          console.error(event)
        },
      },
    },
  },
})

// writingArtifacts: {
//   invoke: {
//     src: writingArtifacts,
//     id: `writing-artifacts`,
//     onDone: {
//       target: `idle`,
//     },
//     onError: {
//       target: `idle`,
//     },
//   },
// },

// batchingPageMutations: {
//   invoke: {
//     src: batchingPageMutations,
//     id: `batchingPageMutations`,
//     onDone: {
//       target: `runningStaticQueries`,
//     },
//     onError: {
//       target: `idle`,
//     },
//   },
// },
