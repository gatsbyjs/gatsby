import { IBuildContext } from "./develop"
import { MachineConfig } from "xstate"

import { dataLayerStates } from "./data-layer"
import { queryStates } from "./queries"
import {
  ADD_NODE_MUTATION,
  SOURCE_FILE_CHANGED,
} from "./shared-transition-configs"

export const runningStates: MachineConfig<IBuildContext, any, any> = {
  initial: `initializingDataLayer`,
  states: {
    initializingDataLayer: {
      id: `initializingDataLayer`,
      on: {
        ADD_NODE_MUTATION: {
          actions: `callApi`,
        },
      },
      ...dataLayerStates,
    },
    extractingAndRunningQueries: {
      id: `extractingAndRunningQueries`,
      on: {
        ADD_NODE_MUTATION,
        SOURCE_FILE_CHANGED,
      },
      ...queryStates,
      onDone: {
        target: `complete`,
      },
    },
    complete: {
      type: `final`,
    },
  },
}
