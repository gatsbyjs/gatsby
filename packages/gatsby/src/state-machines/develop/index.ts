import { MachineConfig, AnyEventObject, forwardTo, Machine } from "xstate"
import { IDataLayerContext } from "../data-layer/types"
import { IQueryRunningContext } from "../query-running/types"
import { IWaitingContext } from "../waiting/types"
import { buildActions } from "./actions"
import { developServices } from "./services"
import { IBuildContext } from "../../services"

/**
 * This is the top-level state machine for the `gatsby develop` command
 */
const developConfig: MachineConfig<IBuildContext, any, AnyEventObject> = {
  id: `build`,
  initial: `initializing`,
  states: {
    initializing: {
      on: {
        // Ignore mutation events because we'll be running everything anyway
        ADD_NODE_MUTATION: undefined,
        QUERY_FILE_CHANGED: undefined,
        WEBHOOK_RECEIVED: undefined,
      },
      invoke: {
        src: `initialize`,
        onDone: {
          target: `initializingDataLayer`,
          actions: [`assignStoreAndWorkerPool`, `spawnMutationListener`],
        },
      },
    },
    initializingDataLayer: {
      on: {
        ADD_NODE_MUTATION: {
          actions: [`markNodesDirty`, `callApi`],
        },
        // Ignore, because we're about to extract them anyway
        QUERY_FILE_CHANGED: undefined,
      },
      invoke: {
        src: `initializeDataLayer`,
        data: ({
          parentSpan,
          store,
          firstRun,
          webhookBody,
        }: IBuildContext): IDataLayerContext => {
          return {
            parentSpan,
            store,
            firstRun,
            deferNodeMutation: true,
            webhookBody,
          }
        },
        onDone: {
          actions: [
            `assignServiceResult`,
            `clearWebhookBody`,
            `finishParentSpan`,
          ],
          target: `runningQueries`,
        },
      },
    },
    runningQueries: {
      on: {
        QUERY_FILE_CHANGED: {
          actions: forwardTo(`run-queries`),
        },
      },
      invoke: {
        id: `run-queries`,
        src: `runQueries`,
        data: ({
          program,
          store,
          parentSpan,
          gatsbyNodeGraphQLFunction,
          graphqlRunner,
          websocketManager,
          firstRun,
        }: IBuildContext): IQueryRunningContext => {
          return {
            firstRun,
            program,
            store,
            parentSpan,
            gatsbyNodeGraphQLFunction,
            graphqlRunner,
            websocketManager,
          }
        },
        onDone: [
          {
            target: `startingDevServers`,
            cond: ({ firstRun }: IBuildContext): boolean => !!firstRun,
          },
          {
            target: `waiting`,
          },
        ],
      },
    },
    startingDevServers: {
      invoke: {
        src: `startWebpackServer`,
        onDone: {
          target: `waiting`,
          actions: `assignServers`,
        },
      },
    },
    waiting: {
      // We may want to save this is more places, but this should do for now
      entry: `saveDbState`,
      on: {
        ADD_NODE_MUTATION: {
          actions: forwardTo(`waiting`),
        },
        QUERY_FILE_CHANGED: {
          actions: forwardTo(`waiting`),
        },
        EXTRACT_QUERIES_NOW: {
          target: `runningQueries`,
        },
      },
      invoke: {
        id: `waiting`,
        src: `waitForMutations`,
        data: ({
          store,
          nodeMutationBatch = [],
        }: IBuildContext): IWaitingContext => {
          return { store, nodeMutationBatch, runningBatch: [] }
        },
        onDone: {
          actions: `assignServiceResult`,
          target: `rebuildingPages`,
        },
      },
    },
    rebuildingPages: {
      invoke: {
        src: `initializeDataLayer`,
        data: ({ parentSpan, store }: IBuildContext): IDataLayerContext => {
          return { parentSpan, store, firstRun: false, skipSourcing: true }
        },
        onDone: {
          actions: `assignServiceResult`,
          target: `runningQueries`,
        },
      },
    },
  },
  // Transitions shared by all states, except where overridden
  on: {
    ADD_NODE_MUTATION: {
      actions: `addNodeMutation`,
    },
    QUERY_FILE_CHANGED: {
      actions: `markQueryFilesDirty`,
    },
    WEBHOOK_RECEIVED: {
      target: `initializingDataLayer`,
      actions: `assignWebhookBody`,
    },
  },
}

export const developMachine = Machine(developConfig, {
  services: developServices,
  actions: buildActions,
})
