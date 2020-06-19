import {
  Machine,
  assign,
  DoneInvokeEvent,
  AnyEventObject,
  MachineConfig,
} from "xstate"
import { IBuildContext } from "../services"
import { startWebpackServer } from "../services/start-webpack-server"
import { WebsocketManager } from "../utils/websocket-manager"
import { Compiler } from "webpack"
import { idleStates } from "./waiting"
import {
  ADD_NODE_MUTATION,
  SOURCE_FILE_CHANGED,
} from "./shared-transition-configs"
import { buildActions } from "./actions"
import { runningStates } from "./running"
import JestWorker from "jest-worker"
import { buildServices } from "../services"

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
          // Empty string event runs every time
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
