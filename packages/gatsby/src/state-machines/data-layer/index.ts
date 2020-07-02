import { MachineConfig, Machine } from "xstate"
import { dataLayerActions } from "./actions"
import { IDataLayerContext } from "./types"
import { dataLayerServices } from "./services"

export type DataLayerResult = Pick<
  IDataLayerContext,
  | "gatsbyNodeGraphQLFunction"
  | "graphqlRunner"
  | "pagesToBuild"
  | "pagesToDelete"
>

const dataLayerStates: MachineConfig<IDataLayerContext, any, any> = {
  initial: `start`,
  states: {
    start: {
      on: {
        "": [
          {
            target: `buildingSchema`,
            cond: ({ skipSourcing }: IDataLayerContext): boolean =>
              !!skipSourcing,
          },
          {
            target: `customizingSchema`,
          },
        ],
      },
    },
    customizingSchema: {
      invoke: {
        src: `customizeSchema`,
        id: `customizing-schema`,
        onDone: {
          target: `sourcingNodes`,
        },
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
      },
    },
    buildingSchema: {
      invoke: {
        id: `building-schema`,
        src: `buildSchema`,
        onDone: {
          target: `creatingPages`,
          actions: `assignGatsbyNodeGraphQL`,
        },
      },
    },
    creatingPages: {
      on: { ADD_NODE_MUTATION: { actions: [`markNodesDirty`, `callApi`] } },
      invoke: {
        id: `creating-pages`,
        src: `createPages`,
        onDone: [
          {
            target: `creatingPagesStatefully`,
            actions: `assignChangedPages`,
            cond: (context): boolean => !!context.firstRun,
          },
          {
            target: `done`,
            actions: `assignChangedPages`,
          },
        ],
      },
    },
    creatingPagesStatefully: {
      invoke: {
        src: `createPagesStatefully`,
        id: `creating-pages-statefully`,
        onDone: {
          target: `done`,
        },
      },
    },
    done: {
      type: `final`,
      data: ({
        gatsbyNodeGraphQLFunction,
        graphqlRunner,
        pagesToBuild,
        pagesToDelete,
      }): DataLayerResult => {
        return {
          gatsbyNodeGraphQLFunction,
          graphqlRunner,
          pagesToBuild,
          pagesToDelete,
        }
      },
    },
  },
}

export const dataLayerMachine = Machine(dataLayerStates, {
  actions: dataLayerActions,
  services: dataLayerServices,
})
