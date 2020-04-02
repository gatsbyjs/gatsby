import { customizeSchema } from "../services/customize-schema"
import { sourceNodes } from "../services/source-nodes"
import { DoneInvokeEvent, assign, MachineConfig } from "xstate"
import { createPages } from "../services/create-pages"
import { buildSchema } from "../services/build-schema"
import { IBuildContext } from "./develop"
import { createPagesStatefully } from "../services/create-pages-statefully"
import { runMutationAndMarkDirty } from "./shared-transition-configs"

const assignMutatedNodes = assign<any, DoneInvokeEvent<any>>(
  (context, event) => {
    return {
      nodesMutatedDuringQueryRun:
        context.nodesMutatedDuringQueryRun || event.data?.nodesMutated,
    }
  }
)

export const dataLayerStates: MachineConfig<IBuildContext, any, any> = {
  initial: `customizingSchema`,
  states: {
    customizingSchema: {
      invoke: {
        src: customizeSchema,
        id: `customizing-schema`,
        onDone: {
          target: `sourcingNodes`,
        },
        onError: {
          target: `#build.waiting`,
        },
      },
    },
    sourcingNodes: {
      invoke: {
        src: sourceNodes,
        id: `sourcing-nodes`,
        onDone: {
          target: `buildingSchema`,
        },
        onError: {
          target: `#build.waiting`,
        },
      },
    },
    buildingSchema: {
      invoke: {
        id: `building-schema`,
        src: buildSchema,
        onDone: {
          target: `creatingPages`,
          actions: assign<any, DoneInvokeEvent<any>>((context, event) => {
            const { graphqlRunner } = event.data
            return {
              graphqlRunner,
            }
          }),
        },
        onError: {
          target: `#build.waiting`,
        },
      },
    },
    creatingPages: {
      on: { ADD_NODE_MUTATION: runMutationAndMarkDirty },
      invoke: {
        id: `creating-pages`,
        src: createPages,
        onDone: [
          {
            target: `creatingPagesStatefully`,
            cond: (context): boolean => context.firstRun,
          },
          {
            target: `#build.extractingAndRunningQueries`,
            actions: assignMutatedNodes,
          },
        ],
        onError: {
          target: `#build.waiting`,
        },
      },
    },
    creatingPagesStatefully: {
      on: {
        "": [
          {
            cond: (ctx): boolean => !!ctx.filesDirty,
            target: `#build.extractingAndRunningQueries`,
          },
        ],
        ADD_NODE_MUTATION: runMutationAndMarkDirty,
      },
      invoke: {
        src: createPagesStatefully,
        id: `creating-pages-statefully`,
        onDone: {
          target: `#build.extractingAndRunningQueries`,
        },
        onError: {
          target: `#build.waiting`,
        },
      },
    },
  },
}
