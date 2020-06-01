import { MachineConfig, DoneInvokeEvent, assign } from "xstate"
import { IBuildContext } from "./develop"
import { runMutationAndMarkDirty, onError } from "./shared-transition-configs"
import { log } from "xstate/lib/actions"

const MAX_RECURSION = 2

const extractQueriesIfDirty = {
  cond: (ctx): boolean => !!ctx.filesDirty,
  target: `extractingQueries`,
}

const emitStaticQueryDataToWebsocket = (
  { websocketManager }: IBuildContext,
  { data: { results } }: DoneInvokeEvent<any>
): void => {
  if (websocketManager && results) {
    results.forEach((result, id) => {
      websocketManager.emitStaticQueryData({
        result,
        id,
      })
    })
  }
}

const emitPageDataToWebsocket = (
  { websocketManager }: IBuildContext,
  { data: { results } }: DoneInvokeEvent<any>
): void => {
  console.log({ websocketManager, results })
  if (websocketManager && results) {
    results.forEach((result, id) => {
      websocketManager.emitPageData({
        result,
        id,
      })
    })
  }
}

export const queryStates: MachineConfig<IBuildContext, any, any> = {
  initial: `extractingQueries`,
  states: {
    extractingQueries: {
      id: `extracting-queries`,
      invoke: {
        id: `extracting-queries`,
        src: `extractQueries`,
        onDone: [
          {
            target: `writingRequires`,
          },
        ],
        onError,
      },
    },
    writingRequires: {
      invoke: {
        src: `writeOutRequires`,
        id: `writing-requires`,
        onDone: {
          target: `calculatingDirtyQueries`,
        },
        onError: {
          target: `#build.failed`,
        },
      },
    },
    calculatingDirtyQueries: {
      on: {
        "": extractQueriesIfDirty,
      },
      invoke: {
        id: `calculating-dirty-queries`,
        src: `calculateDirtyQueries`,
        onDone: [
          {
            target: `runningStaticQueries`,
            actions: assign<IBuildContext, DoneInvokeEvent<any>>(
              (_context, { data }) => {
                const { queryIds } = data
                return {
                  filesDirty: false,
                  queryIds,
                }
              }
            ),
          },
        ],
        onError,
      },
    },
    runningStaticQueries: {
      on: {
        "": extractQueriesIfDirty,
        ADD_NODE_MUTATION: runMutationAndMarkDirty,
      },
      invoke: {
        src: `runStaticQueries`,
        id: `running-static-queries`,
        onDone: [
          {
            target: `runningPageQueries`,
            actions: emitStaticQueryDataToWebsocket,
            cond: (context): boolean => !!context.websocketManager,
          },
          {
            target: `runningPageQueries`,
          },
        ],
        onError,
      },
    },
    runningPageQueries: {
      on: {
        "": extractQueriesIfDirty,
        ADD_NODE_MUTATION: runMutationAndMarkDirty,
      },
      invoke: {
        src: `runPageQueries`,
        id: `running-page-queries`,
        onDone: [
          {
            target: `checkingForMutatedNodes`,
            actions: emitPageDataToWebsocket,
            cond: (context): boolean => !!context.websocketManager,
          },
          {
            target: `checkingForMutatedNodes`,
          },
        ],
        // onError,
      },
    },
    checkingForMutatedNodes: {
      on: {
        "": [
          // Nothing was mutated. Moving to next state
          {
            target: `waitingForJobs`,
            cond: (context): boolean => !context.nodesMutatedDuringQueryRun,
          },
          // Nodes were mutated. Starting again.
          {
            actions: [
              assign(context => {
                return {
                  recursionCount: context.recursionCount + 1,
                  nodesMutatedDuringQueryRun: false, // Resetting
                }
              }),
              log(context => `mutated. count ${context.recursionCount}`),
            ],
            target: `#initializingDataLayer`,
            cond: (ctx): boolean => ctx.recursionCount < MAX_RECURSION,
          },
          // We seem to be stuck in a loop. Bailing.
          {
            actions: [
              assign<IBuildContext>({
                recursionCount: 0,
                nodesMutatedDuringQueryRun: false, // Resetting
              }),
              log(`Errro`),
            ],
            target: `#build.waiting`,
          },
        ],
      },
    },
    waitingForJobs: {
      invoke: {
        src: `waitUntilAllJobsComplete`,
        id: `waiting-for-jobs`,
        onDone: {
          target: `done`,
        },
      },
    },
    done: {
      type: `final`,
    },
  },
}
