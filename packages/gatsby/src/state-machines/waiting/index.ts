import { MachineConfig, assign, createMachine } from "xstate"
import { IWaitingContext } from "./types"
import { waitingActions } from "./actions"
import { waitingServices } from "./services"

const NODE_MUTATION_BATCH_SIZE = 100
const NODE_MUTATION_BATCH_TIMEOUT = 500
const FILE_CHANGE_AGGREGATION_TIMEOUT = 200

export type WaitingResult = Pick<IWaitingContext, "nodeMutationBatch">

/**
 * This idle state also handles batching of node mutations and running of
 * mutations when we first start it
 */
export const waitingStates: MachineConfig<IWaitingContext, any, any> = {
  predictableActionArguments: true,
  id: `waitingMachine`,
  initial: `idle`,
  context: {
    nodeMutationBatch: [],
    runningBatch: [],
  },
  states: {
    idle: {
      always: [
        {
          // If we already have queued node mutations, move
          // immediately to batching
          cond: (ctx): boolean => !!ctx.nodeMutationBatch.length,
          target: `batchingNodeMutations`,
        },
        {
          // If source files are dirty upon entering this state,
          // move immediately to aggregatingFileChanges to force re-compilation
          // See https://github.com/gatsbyjs/gatsby/issues/27609
          target: `aggregatingFileChanges`,
          cond: ({ sourceFilesDirty }): boolean => Boolean(sourceFilesDirty),
        },
      ],
      on: {
        ADD_NODE_MUTATION: {
          actions: `addNodeMutation`,
          target: `batchingNodeMutations`,
        },
        // We only listen for this when idling because if we receive it at any
        // other point we're already going to create pages etc
        SOURCE_FILE_CHANGED: {
          target: `aggregatingFileChanges`,
        },
      },
    },
    aggregatingFileChanges: {
      // Sigh. This is because webpack doesn't expose the Watchpack
      // aggregated file invalidation events. If we compile immediately,
      // we won't pick up the changed files
      after: {
        // The aggregation timeout
        [FILE_CHANGE_AGGREGATION_TIMEOUT]: {
          actions: `extractQueries`,
          target: `idle`,
        },
      },
      on: {
        ADD_NODE_MUTATION: {
          actions: `addNodeMutation`,
          target: `batchingNodeMutations`,
        },
        SOURCE_FILE_CHANGED: {
          target: undefined,
          // External self-transition reset the timer
          internal: false,
        },
      },
    },
    batchingNodeMutations: {
      // Check if the batch is already full on entry
      always: {
        cond: (ctx): boolean =>
          ctx.nodeMutationBatch.length >= NODE_MUTATION_BATCH_SIZE,
        target: `committingBatch`,
      },
      on: {
        // More mutations added to batch
        ADD_NODE_MUTATION: [
          // You know the score: only run the first matching transition
          {
            // If this fills the batch then commit it
            actions: `addNodeMutation`,
            cond: (ctx): boolean =>
              ctx.nodeMutationBatch.length >= NODE_MUTATION_BATCH_SIZE,
            target: `committingBatch`,
          },
          {
            // ...otherwise just add it to the batch
            actions: `addNodeMutation`,
          },
        ],
      },
      after: {
        // Time's up
        [NODE_MUTATION_BATCH_TIMEOUT]: `committingBatch`,
      },
    },
    committingBatch: {
      entry: assign<IWaitingContext>(({ nodeMutationBatch }) => {
        return {
          nodeMutationBatch: [],
          runningBatch: nodeMutationBatch,
        }
      }),
      on: {
        // While we're running the batch we will also run new actions, as these may be cascades
        ADD_NODE_MUTATION: {
          actions: `callApi`,
        },
      },
      invoke: {
        src: `runMutationBatch`,
        // When we're done, clear the running batch ready for next time
        onDone: {
          actions: assign<IWaitingContext, any>({
            runningBatch: [],
          }),
          target: `rebuild`,
        },
      },
    },
    rebuild: {
      type: `final`,
      // This is returned to the parent. The batch includes
      // any mutations that arrived while we were running the other batch
      data: ({ nodeMutationBatch }): WaitingResult => {
        return { nodeMutationBatch }
      },
    },
  },
}

export const waitingMachine = createMachine(waitingStates, {
  actions: waitingActions,
  services: waitingServices,
})
