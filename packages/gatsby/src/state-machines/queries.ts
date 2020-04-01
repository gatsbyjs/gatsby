import { MachineConfig, DoneInvokeEvent, assign } from "xstate"
import { IBuildContext, runMutationAndMarkDirty } from "./develop"
import { extractQueries } from "../services/extract-queries"
import { writeOutRequires } from "../services/write-out-requires"
import { calculateDirtyQueries } from "../services/calculate-dirty-queries"
import { runStaticQueries } from "../services/run-static-queries"
import { runPageQueries } from "../services/run-page-queries"
import { waitUntilAllJobsComplete } from "../utils/wait-until-jobs-complete"

const MAX_RECURSION = 2

const extractQueriesIfDirty = {
  cond: (ctx): boolean => !!ctx.filesDirty,
  target: `extractingQueries`,
}

const emitStaticQueryDataToWebsocket = (
  { websocketManager }: IBuildContext,
  { data: { results } }: DoneInvokeEvent<any>
): void => {
  if (results) {
    results.forEach((result, id) => {
      // eslint-disable-next-line no-unused-expressions
      websocketManager?.emitStaticQueryData({
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
  if (results) {
    results.forEach((result, id) => {
      // eslint-disable-next-line no-unused-expressions
      websocketManager?.emitPageData({
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
      invoke: {
        id: `extracting-queries`,
        src: extractQueries,
        onDone: [
          {
            target: `writingRequires`,
          },
        ],
        onError: {
          target: `#build.waiting`,
        },
      },
    },
    writingRequires: {
      invoke: {
        src: writeOutRequires,
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
        src: calculateDirtyQueries,
        onDone: [
          {
            target: `runningStaticQueries`,
            actions: assign<any, DoneInvokeEvent<any>>((context, { data }) => {
              const { queryIds } = data
              return {
                filesDirty: false,
                queryIds,
              }
            }),
          },
        ],
        onError: {
          target: `#build.waiting`,
        },
      },
    },
    runningStaticQueries: {
      on: {
        "": extractQueriesIfDirty,
        ADD_NODE_MUTATION: runMutationAndMarkDirty,
      },
      invoke: {
        src: runStaticQueries,
        id: `running-static-queries`,
        onDone: {
          target: `runningPageQueries`,
          actions: [emitStaticQueryDataToWebsocket],
        },
        onError: {
          target: `#build.waiting`,
        },
      },
    },
    runningPageQueries: {
      on: {
        "": extractQueriesIfDirty,
        ADD_NODE_MUTATION: runMutationAndMarkDirty,
      },
      invoke: {
        src: runPageQueries,
        id: `running-page-queries`,
        onDone: [
          {
            target: `checkingForMutatedNodes`,
            actions: [emitPageDataToWebsocket],
          },
        ],
        onError: {
          target: `#build.waiting`,
        },
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
            ],
            target: `#build.initializingDataLayer`,
            cond: (ctx): boolean => ctx.recursionCount < MAX_RECURSION,
          },
          // We seem to be stuck in a loop. Bailing.
          {
            actions: [
              assign<IBuildContext>({
                recursionCount: 0,
                nodesMutatedDuringQueryRun: false, // Resetting
              }),
            ],
            target: `#build.waiting`,
          },
        ],
      },
    },
    waitingForJobs: {
      invoke: {
        src: waitUntilAllJobsComplete,
        id: `waiting-for-jobs`,
        onDone: [
          {
            target: `#build.runningWebpack`,
            cond: (ctx): boolean => ctx.firstRun,
          },
          {
            target: `#build.waiting`,
          },
        ],
        onError: {
          target: `#build.waiting`,
        },
      },
    },
  },
}
