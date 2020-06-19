import { IBuildContext } from "../services"
import { MachineConfig } from "xstate"
import { runMutationAndMarkDirty, onError } from "./shared-transition-configs"

export const dataLayerStates: MachineConfig<IBuildContext, any, any> = {
  initial: `customizingSchema`,
  states: {
    customizingSchema: {
      invoke: {
        src: `customizeSchema`,
        id: `customizing-schema`,
        onDone: {
          target: `sourcingNodes`,
        },
        onError,
      },
    },
    sourcingNodes: {
      invoke: {
        src: `sourceNodes`,
        id: `sourcing-nodes`,
        onDone: {
          target: `buildingSchema`,
          actions: `assignChangedPages`,
        },
        onError,
      },
    },
    buildingSchema: {
      invoke: {
        id: `building-schema`,
        src: `buildSchema`,
        onDone: {
          target: `creatingPages`,
          actions: `assignGatsbyNodeGraphQl`,
        },
        onError,
      },
    },
    creatingPages: {
      on: { ADD_NODE_MUTATION: runMutationAndMarkDirty },
      invoke: {
        id: `creating-pages`,
        src: `createPages`,
        onDone: [
          {
            target: `creatingPagesStatefully`,
            actions: `assignChangedPages`,
            cond: (context): boolean => context.firstRun,
          },
          {
            target: `#build.running.extractingAndRunningQueries`,
            actions: `assignChangedPages`,
          },
        ],
        onError,
      },
    },
    creatingPagesStatefully: {
      on: {
        "": [
          {
            cond: (ctx): boolean => !!ctx.filesDirty,
            target: `#extracting-queries`,
          },
        ],
        ADD_NODE_MUTATION: runMutationAndMarkDirty,
      },
      invoke: {
        src: `createPagesStatefully`,
        id: `creating-pages-statefully`,
        onDone: {
          target: `#build.running.extractingAndRunningQueries`,
        },
        onError,
      },
    },
  },
}
