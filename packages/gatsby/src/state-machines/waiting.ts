import { MachineConfig, assign } from "xstate"
import { IBuildContext } from "./develop"
import { callRealApi } from "./actions"

const NODE_MUTATION_BATCH_SIZE = 100
const NODE_MUTATION_BATCH_TIMEOUT = 1000

const extractQueriesIfDirty = {
  cond: (ctx): boolean => !!ctx.filesDirty,
  target: `#extractingAndRunningQueries`,
}

export const idleStates: MachineConfig<IBuildContext, any, any> = {
  initial: `idle`,
  states: {
    // There is an empty bus and doors are closed
    idle: {
      entry: [
        assign<IBuildContext>({
          webhookBody: undefined,
          refresh: false,
          recursionCount: 0,
          nodesMutatedDuringQueryRun: false,
        }),
      ],
      on: {
        "": [
          // Node mutations are prioritised because we don't want
          // to run queries on data that is stale
          {
            cond: (ctx): boolean => !!ctx.nodeMutationBatch?.length,
            target: `batchingNodeMutations`,
          },
          extractQueriesIfDirty,
        ],
        WEBHOOK_RECEIVED: {
          target: `refreshing`,
          actions: assign((_ctx, event) => {
            return { webhookBody: event.body }
          }),
        },
        ADD_NODE_MUTATION: {
          actions: `addNodeMutation`,
          target: `batchingNodeMutations`,
        },
        SOURCE_FILE_CHANGED: {
          target: `#extractingAndRunningQueries`,
        },
      },
    },

    refreshing: {
      invoke: {
        src: async (): Promise<void> => {},
        id: `refreshing`,
        onDone: {
          target: `#initializingDataLayer`,
          actions: assign<IBuildContext>({
            refresh: true,
          }),
        },
        onError: {
          target: `#build.failed`,
        },
      },
    },

    // Doors are open for people to enter
    batchingNodeMutations: {
      on: {
        // Check if the batch is already full on entry
        "": {
          cond: (ctx): boolean =>
            ctx.nodeMutationBatch?.length >= NODE_MUTATION_BATCH_SIZE,
          target: `committingBatch`,
        },
        // More people enter same bus
        ADD_NODE_MUTATION: [
          // If this fills the batch then commit it
          {
            actions: [`addNodeMutation`],
            cond: (ctx): boolean =>
              ctx.nodeMutationBatch?.length >= NODE_MUTATION_BATCH_SIZE,
            target: `committingBatch`,
          },
          // otherwise just add it to the batch
          {
            actions: `addNodeMutation`,
          },
        ],
      },

      // Check if bus is either full or if enough time has passed since
      // first passenger entered the bus

      // Fallback
      after: {
        [NODE_MUTATION_BATCH_TIMEOUT]: `committingBatch`,
      },
    },
    committingBatch: {
      entry: [
        assign(context => {
          // console.log(
          //   `context at entry for committing batch`,
          //   context.runningBatch,
          //   context.nodeMutationBatch
          // )
          // Move the contents of the batch into a batch for running
          return {
            target: `#initializingDataLayer.buildingSchema`,
            nodeMutationBatch: [],
            runningBatch: context.nodeMutationBatch,
          }
        }),
      ],
      invoke: {
        src: async ({ runningBatch, store }: IBuildContext): Promise<any> =>
          // Consume the entire batch and run actions
          Promise.all(runningBatch.map(payload => callRealApi(payload, store))),
        onDone: {
          target: `#initializingDataLayer.buildingSchema`,
          actions: assign<IBuildContext>({
            runningBatch: [],
          }),
        },
      },
    },
  },
}
