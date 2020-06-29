import { MachineConfig, Machine } from "xstate"
import { IQueryRunningContext } from "./types"
import { queryRunningServices } from "./services"
import { queryActions } from "./actions"

const extractQueriesIfDirty = {
  cond: (ctx: IQueryRunningContext): boolean => !!ctx.filesDirty,
  target: `extractingQueries`,
}

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
            actions: `resetGraphQlRunner`,
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
      // Disabled because we're not watching for node mutations
      // at the moment
      // on: {
      //   "": extractQueriesIfDirty,
      //   SOURCE_FILE_CHANGED,
      // },
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
      on: {
        "": extractQueriesIfDirty,
      },
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
      // on: {
      //   "": extractQueriesIfDirty,
      // },
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
// eslint-disable-next-line new-cap
export const queryRunningMachine = Machine(queryStates, {
  actions: queryActions,
  services: queryRunningServices,
})
