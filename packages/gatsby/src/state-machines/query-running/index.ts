import { MachineConfig, Machine } from "xstate"
import { IQueryRunningContext } from "./types"
import { queryRunningServices } from "./services"
import { queryActions } from "./actions"
import { getAbsolutePathForVirtualModule } from "../../utils/gatsby-webpack-virtual-modules"

const internalModulesThatDontNeedToResetQueryRunningStateMachine: Array<string> = [
  `$virtual/async-requires.js`,
  `$virtual/sync-requires.js`,
  `$virtual/match-paths.json`,
].map(getAbsolutePathForVirtualModule)

/**
 * This is a child state machine, spawned to perform the query running
 */

export const queryStates: MachineConfig<IQueryRunningContext, any, any> = {
  initial: `extractingQueries`,
  id: `queryRunningMachine`,
  on: {
    SOURCE_FILE_CHANGED: {
      target: `extractingQueries`,
      cond: (_, sourceFileChangeEvent): boolean =>
        !internalModulesThatDontNeedToResetQueryRunningStateMachine.includes(
          sourceFileChangeEvent.file
        ),
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
          target: `writingRequires`,
          actions: `flushPageData`,
        },
      },
    },
    writingRequires: {
      invoke: {
        src: `writeOutRequires`,
        id: `writing-requires`,
        onDone: {
          target: `waitingForJobs`,
        },
      },
    },
    // This waits for the jobs API to finish
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
