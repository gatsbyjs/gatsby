import {
  Machine,
  assign,
  DoneInvokeEvent,
  Actor,
  AnyEventObject,
  MachineConfig,
} from "xstate"
import { Express } from "express"
import { startWebpackServer } from "../services/start-webpack-server"
import { WebsocketManager } from "../utils/websocket-manager"
import { Store } from "redux"
import { Compiler } from "webpack"
import { Span } from "opentracing"
import { GraphQLRunner } from "../query/graphql-runner"
import { idleStates } from "./waiting"
import {
  ADD_NODE_MUTATION,
  SOURCE_FILE_CHANGED,
} from "./shared-transition-configs"
import { IProgram } from "../commands/types"
import { IGroupedQueryIds } from "../services/calculate-dirty-queries"
import { buildActions } from "./actions"
import { IGatsbyState } from "../redux/types"
import { runningStates } from "./running"
import JestWorker from "jest-worker"
import { buildServices } from "../services"

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
  workerPool?: JestWorker
  pagesToBuild?: string[]
  pagesToDelete?: string[]
  mutationListener?: Actor<any, AnyEventObject>
}

export const INITIAL_CONTEXT: IBuildContext = {
  recursionCount: 0,
  nodesMutatedDuringQueryRun: false,
  firstRun: true,
  nodeMutationBatch: [],
  runningBatch: [],
}

const developConfig: MachineConfig<IBuildContext, any, AnyEventObject> = {
  id: `build`,
  initial: `setup`,
  context: INITIAL_CONTEXT,
  states: {
    setup: {
      on: {
        "": {
          actions: `spawnMutationListener`,
          cond: (context): boolean => !context.mutationListener,
        },
        ADD_NODE_MUTATION: {
          actions: `callApi`,
        },
      },
      invoke: {
        src: `initialize`,
        onDone: {
          target: `running`,
          actions: `assignBootstrap`,
        },
      },
    },
    running: {
      ...runningStates,
      onDone: [
        {
          target: `runningWebpack`,
          cond: (ctx): boolean => ctx.firstRun,
        },
        {
          target: `waiting`,
          actions: (ctx): void => console.log(ctx.queryIds),
        },
      ],
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
          actions: assign<
            IBuildContext,
            DoneInvokeEvent<{
              compiler: Compiler
              websocketManager: WebsocketManager
              workerPool: JestWorker
            }>
          >((_context, { data }) => {
            return {
              ...data,
              firstRun: false,
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
}

// eslint-disable-next-line new-cap
export const developMachine = Machine<IBuildContext>(developConfig, {
  actions: buildActions,
  services: buildServices,
})
