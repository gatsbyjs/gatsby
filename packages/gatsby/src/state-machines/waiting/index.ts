import { MachineConfig, assign, Machine } from "xstate"
import { IWaitingContext } from "./types"
import { waitingActions } from "./actions"
import { waitingServices } from "./services"

const NODE_MUTATION_BATCH_SIZE = 100
const NODE_MUTATION_BATCH_TIMEOUT = 1000

export type WaitingResult = Pick<IWaitingContext, "nodeMutationBatch">

export const waitingStates: MachineConfig<IWaitingContext, any, any> = {
  initial: `idle`,
  states: {
    idle: {
      on: {
        "":
          // If we already have queued node mutations, move
          // immediately to batching
          {
            cond: (ctx): boolean => !!ctx.nodeMutationBatch?.length,
            target: `batchingNodeMutations`,
          },
        ADD_NODE_MUTATION: {
          actions: `addNodeMutation`,
          target: `batchingNodeMutations`,
        },
      },
    },

    batchingNodeMutations: {
      on: {
        // Check if the batch is already full on entry
        "": {
          cond: (ctx): boolean =>
            ctx.nodeMutationBatch?.length >= NODE_MUTATION_BATCH_SIZE,
          target: `committingBatch`,
        },
        // More mutations added to batch
        ADD_NODE_MUTATION: [
          // If this fills the batch then commit it
          {
            actions: `addNodeMutation`,
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
      // Time's up
      after: {
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
        // While we're running the batch we need to batch any incoming mutations too
        ADD_NODE_MUTATION: {
          actions: `addNodeMutation`,
        },
      },
      invoke: {
        src: `runMutationBatch`,
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
      data: ({ nodeMutationBatch }): WaitingResult => {
        return { nodeMutationBatch }
      },
    },
  },
}

// eslint-disable-next-line new-cap
export const waitingMachine = Machine(waitingStates, {
  actions: waitingActions,
  services: waitingServices,
})
