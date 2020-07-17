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
  // These are mutation events, sent to this machine by the mutation listener
  // in `services/listen-for-mutations.ts`
  on: {
    // These are deferred node mutations, mainly `createNode`
    ADD_NODE_MUTATION: {
      actions: `addNodeMutation`,
    },
    // Sent by query watcher, these are chokidar file events. They mean we
    // need to extract queries
    QUERY_FILE_CHANGED: {
      actions: `markQueryFilesDirty`,
    },
    // These are calls to the refresh endpoint. Also used by Gatsby Preview
    WEBHOOK_RECEIVED: {
      target: `initializingDataLayer`,
      actions: `assignWebhookBody`,
    },
  },
  states: {
    // Here we handle the initial bootstrap
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
    // Sourcing nodes, customising and inferring schema, then running createPages
    initializingDataLayer: {
      on: {
        // We need to run mutations immediately when in this state
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
    // Running page and static queries and generating the SSRed HTML and page data
    runningQueries: {
      on: {
        QUERY_FILE_CHANGED: {
          actions: forwardTo(`run-queries`),
        },
      },
      invoke: {
        id: `run-queries`,
        src: `runQueries`,
        // This is all the data that we're sending to the child machine
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
            // If this is first run, start webpack and websocket servers
            target: `startingDevServers`,
            cond: ({ firstRun }: IBuildContext): boolean => !!firstRun,
          },
          {
            // ...otherwise just wait. xstate performs just the first transition
            // that matches.
            target: `waiting`,
          },
        ],
      },
    },
    // Spin up webpack and socket.io
    startingDevServers: {
      invoke: {
        src: `startWebpackServer`,
        onDone: {
          target: `waiting`,
          actions: `assignServers`,
        },
      },
    },
    // Idle, waiting for events that make us rebuild
    waiting: {
      // We may want to save this is more places, but this should do for now
      entry: `saveDbState`,
      on: {
        // Forward these events to the child machine, so it can handle batching
        ADD_NODE_MUTATION: {
          actions: forwardTo(`waiting`),
        },
        QUERY_FILE_CHANGED: {
          actions: forwardTo(`waiting`),
        },
        // This event is sent from the child
        EXTRACT_QUERIES_NOW: {
          target: `runningQueries`,
        },
      },
      invoke: {
        id: `waiting`,
        src: `waitForMutations`,
        // Send existing queued mutations to the child machine, which will execute them
        data: ({
          store,
          nodeMutationBatch = [],
        }: IBuildContext): IWaitingContext => {
          return { store, nodeMutationBatch, runningBatch: [] }
        },
        // "done" means we need to rebuild
        onDone: {
          actions: `assignServiceResult`,
          target: `rebuildingPages`,
        },
      },
    },
    // This is the same machine as initializingDataLayer, but sets the context to skip
    // sourcing and jump straight to rebuilding pages
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
}

export const developMachine = Machine(developConfig, {
  services: developServices,
  actions: buildActions,
})
