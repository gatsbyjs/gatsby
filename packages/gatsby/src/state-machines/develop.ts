import { Machine, assign, DoneInvokeEvent } from "xstate"
import { initialize } from "../services/initialize"
import { Express } from "express"
import { startWebpackServer } from "../services/start-webpack-server"
import { WebsocketManager } from "../utils/websocket-manager"
import { Store } from "redux"
import { Compiler } from "webpack"
import { dataLayerStates } from "./data-layer"
import { Span } from "opentracing"
import GraphQLRunner from "../query/graphql-runner"
import { queryStates } from "./queries"
import { idleStates } from "./waiting"
import {
  ADD_NODE_MUTATION,
  SOURCE_FILE_CHANGED,
} from "./shared-transition-configs"
import { IProgram } from "../commands/types"
import { IGroupedQueryIds } from "../services/calculate-dirty-queries"
import { machineActions } from "./actions"
import { IGatsbyState } from "../redux/types"

export interface IMutationAction {
  type: string
  // These are the arguments passed to apiRunnerNode
  payload: unknown[]
}

export interface IBuildContext {
  program?: IProgram
  app?: Express
  recursionCount: number
  nodesMutatedDuringQueryRun: boolean
  firstRun: boolean
  nodeMutationBatch: IMutationAction[]
  filesDirty?: boolean
  runningBatch: IMutationAction[]
  compiler?: Compiler
  websocketManager?: WebsocketManager
  store?: Store<IGatsbyState>
  parentSpan?: Span
  graphqlRunner?: GraphQLRunner
  refresh?: boolean
  webhookBody?: Record<string, unknown>
  queryIds?: IGroupedQueryIds
}

export const INITIAL_CONTEXT: IBuildContext = {
  recursionCount: 0,
  nodesMutatedDuringQueryRun: false,
  firstRun: true,
  nodeMutationBatch: [],
  runningBatch: [],
}

// eslint-disable-next-line new-cap
export const developMachine = Machine<IBuildContext>(
  {
    id: `build`,
    initial: `initializing`,
    context: INITIAL_CONTEXT,
    states: {
      initializing: {
        on: {
          ADD_NODE_MUTATION: {
            actions: `callApi`,
          },
        },
        invoke: {
          src: initialize,
          onDone: {
            target: `initializingDataLayer`,
            actions: assign<
              IBuildContext,
              DoneInvokeEvent<{ store: Store; bootstrapSpan: Span }>
            >((_context, event) => {
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
        on: {
          ADD_NODE_MUTATION: {
            actions: `callApi`,
          },
        },
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
            actions: assign((_context, { data }) => {
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
        type: `final`,
        invoke: {
          src: async (_context, event): Promise<void> => {
            console.error(`I won't build what you tell me`, event)
          },
        },
      },
    },
  },
  {
    actions: machineActions,
  }
)

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
