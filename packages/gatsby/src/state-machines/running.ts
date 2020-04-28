import { IBuildContext } from "./develop"
import { MachineConfig, DoneInvokeEvent, assign, spawn } from "xstate"
import { Store } from "redux"
import { Span } from "opentracing"
import { dataLayerStates } from "./data-layer"
import { queryStates } from "./queries"
import {
  ADD_NODE_MUTATION,
  SOURCE_FILE_CHANGED,
} from "./shared-transition-configs"

export const runningStates: MachineConfig<IBuildContext, any, any> = {
  initial: `initializing`,
  states: {
    initializing: {
      on: {
        ADD_NODE_MUTATION: {
          actions: `callApi`,
        },
      },
      invoke: {
        src: `initialize`,
        onDone: {
          target: `initializingDataLayer`,
          actions: assign<
            IBuildContext,
            DoneInvokeEvent<{ store: Store; bootstrapSpan: Span }>
          >((_context, event) => {
            const { store, bootstrapSpan } = event.data
            return {
              store,
              parentSpan: bootstrapSpan,
            }
          }),
        },
      },
    },
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
