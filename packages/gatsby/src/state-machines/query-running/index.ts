import { MachineConfig, Machine } from "xstate"
import { IQueryRunningContext } from "./types"
import { queryRunningServices } from "./services"
import { queryActions } from "./actions"

const extractQueriesIfFilesAreDirty = {
  cond: (ctx): boolean => !!ctx.filesDirty,
  target: `extractingQueries`,
}

export const queryStates: MachineConfig<IQueryRunningContext, any, any> = {
  initial: `extractingQueries`,
  context: {},
  states: {
    extractingQueries: {
      id: `extracting-queries`,
      onEntry: `markFilesClean`,
      invoke: {
        id: `extracting-queries`,
        src: `extractQueries`,
        onDone: {
          target: `writingRequires`,
        },
      },
    },
    writingRequires: {
      always: extractQueriesIfFilesAreDirty,
      invoke: {
        src: `writeOutRequires`,
        id: `writing-requires`,
        onDone: {
          target: `calculatingDirtyQueries`,
        },
      },
    },
    calculatingDirtyQueries: {
      always: extractQueriesIfFilesAreDirty,
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
      always: extractQueriesIfFilesAreDirty,
      invoke: {
        src: `runStaticQueries`,
        id: `running-static-queries`,
        onDone: {
          target: `runningPageQueries`,
        },
      },
    },
    runningPageQueries: {
      always: extractQueriesIfFilesAreDirty,
      invoke: {
        src: `runPageQueries`,
        id: `running-page-queries`,
        onDone: {
          target: `waitingForJobs`,
          actions: `flushPageData`,
        },
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
