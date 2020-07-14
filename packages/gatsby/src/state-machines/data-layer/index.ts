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
  id: `dataLayerMachine`,
  context: {},
  states: {
    start: {
      always: [
        {
          target: `buildingSchema`,
          cond: `shouldSkipSourcing`,
        },
        {
          target: `customizingSchema`,
        },
      ],
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
          actions: `assignGraphQLRunners`,
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
            cond: `firstRun`,
          },
          {
            target: `rebuildingSchemaWithSitePage`,
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
          target: `rebuildingSchemaWithSitePage`,
        },
      },
    },
    rebuildingSchemaWithSitePage: {
      invoke: {
        src: `rebuildSchemaWithSitePage`,
        onDone: [
          {
            target: `writingOutRedirects`,
            cond: `firstRun`,
          },
          {
            target: `done`,
          },
        ],
      },
    },
    writingOutRedirects: {
      invoke: {
        src: `writeOutRedirects`,
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
  guards: {
    firstRun: ({ firstRun }: IDataLayerContext): boolean => !!firstRun,
    shouldSkipSourcing: ({ skipSourcing }: IDataLayerContext): boolean =>
      !!skipSourcing,
  },
})
