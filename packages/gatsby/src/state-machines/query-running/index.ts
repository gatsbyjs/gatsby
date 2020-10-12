import { MachineConfig, Machine } from "xstate"
import { IQueryRunningContext } from "./types"
import { queryRunningServices } from "./services"
import { queryActions } from "./actions"

/**
 * This is a child state machine, spawned to perform the query running
 */

const PAGE_QUERY_ENQUEUING_TIMEOUT = 50

export const queryStates: MachineConfig<IQueryRunningContext, any, any> = {
  initial: `extractingQueries`,
  id: `queryRunningMachine`,
  on: {
    SOURCE_FILE_CHANGED: {
      actions: `markSourceFilesDirty`,
    },
  },
  context: {},
  states: {
    extractingQueries: {
      id: `extracting-queries`,
      invoke: {
        id: `extracting-queries`,
        src: `extractQueries`,
        onDone: {
          target: `waitingPendingQueries`,
        },
      },
    },
    // This state exists solely because "extractQueries" finishes too early.
    // It finishes before extracted queries are enqueued for execution.
    // As a result calculateDirtyQueries doesn't see them and they are not executed.
    //
    // This happens because extracted queries are enqueued for execution with setTimeout(x, 0)
    // wrapper in actions of redux/machines/page-component which fires after "extractQueries" finishes.
    //
    // see https://github.com/gatsbyjs/gatsby/issues/26580
    //
    // FIXME: this has to be fixed properly by not leaving "extractingQueries" state
    //   until all extracted queries are enqueued for execution (but requires a refactor)
    waitingPendingQueries: {
      id: `waiting-pending-queries`,
      after: {
        [PAGE_QUERY_ENQUEUING_TIMEOUT]: {
          target: `writingRequires`,
          actions: `markSourceFilesClean`,
        },
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
        onDone: {
          target: `runningPageQueries`,
        },
      },
    },
    runningPageQueries: {
      invoke: {
        src: `runPageQueries`,
        id: `running-page-queries`,
        onDone: {
          target: `waitingForJobs`,
          actions: `flushPageData`,
        },
      },
    },
    // This waits for the jobs API to finish
    waitingForJobs: {
      // If files are dirty go and extract again
      always: {
        cond: (ctx): boolean => !!ctx.filesDirty,
        target: `extractingQueries`,
      },
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
