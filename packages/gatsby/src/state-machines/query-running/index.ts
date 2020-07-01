import { MachineConfig, Machine } from "xstate"
import { IQueryRunningContext } from "./types"
import { queryRunningServices } from "./services"
import { queryActions } from "./actions"

export const queryStates: MachineConfig<IQueryRunningContext, any, any> = {
  initial: `extractingQueries`,
  states: {
    extractingQueries: {
      id: `extracting-queries`,
      invoke: {
        id: `extracting-queries`,
        src: `extractQueries`,
        onDone: [
          {
            actions: `resetGraphQLRunner`,
            target: `writingRequires`,
          },
        ],
      },
    },
    writingRequires: {
      invoke: {
        src: `writeOutRequires`,
        id: `writing-requires`,
        onDone: {
          target: `calculatingDirtyQueries`,
        },
      },
    },
    calculatingDirtyQueries: {
      invoke: {
        id: `calculating-dirty-queries`,
        src: `calculateDirtyQueries`,
        onDone: {
          target: `runningStaticQueries`,
          actions: `assignDirtyQueries`,
        },
      },
    },
    runningStaticQueries: {
      invoke: {
        src: `runStaticQueries`,
        id: `running-static-queries`,
        onDone: [
          {
            target: `runningPageQueries`,
            actions: `emitStaticQueryDataToWebsocket`,
            // Only emit if there's a websocket manager
            // This won't be the case on first run, and the query data
            // will be emitted when the client first connects
            cond: (context): boolean => !!context.websocketManager,
          },
          {
            target: `runningPageQueries`,
          },
        ],
      },
    },
    runningPageQueries: {
      invoke: {
        src: `runPageQueries`,
        id: `running-page-queries`,
        onDone: [
          {
            target: `waitingForJobs`,
            actions: `emitPageDataToWebsocket`,
            // Only emit if there's a websocket manager
            // This won't be the case on first run, and the page data
            // will be emitted when the client first connects
            cond: (context): boolean => !!context.websocketManager,
          },
          {
            target: `waitingForJobs`,
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
export const queryRunningMachine = Machine(queryStates, {
  actions: queryActions,
  services: queryRunningServices,
})
