import { Machine, StatesConfig, MachineOptions } from "xstate"
import { dataLayerActions } from "./actions"
import { IDataLayerContext } from "./types"
import { dataLayerServices } from "./services"
import { genericOnError } from "../../utils/generic-on-error"

export type DataLayerResult = Pick<
  IDataLayerContext,
  | "gatsbyNodeGraphQLFunction"
  | "graphqlRunner"
  | "pagesToBuild"
  | "pagesToDelete"
>

const loadDataStates: StatesConfig<IDataLayerContext, any, any> = {
  customizingSchema: {
    invoke: {
      src: `customizeSchema`,
      id: `customizing-schema`,
      onDone: {
        target: `sourcingNodes`,
      },
      onError: genericOnError,
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
      onError: genericOnError,
    },
  },
}

const initialCreatePagesStates: StatesConfig<IDataLayerContext, any, any> = {
  buildingSchema: {
    invoke: {
      id: `building-schema`,
      src: `buildSchema`,
      onDone: {
        target: `creatingPages`,
        actions: `assignGraphQLRunners`,
      },
      onError: genericOnError,
    },
  },
  creatingPages: {
    on: { ADD_NODE_MUTATION: { actions: [`markNodesDirty`, `callApi`] } },
    invoke: {
      id: `creating-pages`,
      src: `createPages`,
      onDone: {
        target: `creatingPagesStatefully`,
        actions: `assignChangedPages`,
      },
      onError: genericOnError,
    },
  },
  creatingPagesStatefully: {
    invoke: {
      src: `createPagesStatefully`,
      id: `creating-pages-statefully`,
      onDone: {
        target: `rebuildingSchemaWithSitePage`,
      },
      onError: genericOnError,
    },
  },
  rebuildingSchemaWithSitePage: {
    invoke: {
      src: `rebuildSchemaWithSitePage`,
      onDone: {
        target: `writingOutRedirects`,
      },
      onError: genericOnError,
    },
  },
  writingOutRedirects: {
    invoke: {
      src: `writeOutRedirectsAndWatch`,
      onDone: {
        target: `done`,
      },
      onError: genericOnError,
    },
  },
}

const recreatePagesStates: StatesConfig<IDataLayerContext, any, any> = {
  buildingSchema: {
    invoke: {
      id: `building-schema`,
      src: `buildSchema`,
      onDone: {
        target: `creatingPages`,
        actions: `assignGraphQLRunners`,
      },
      onError: genericOnError,
    },
  },
  creatingPages: {
    on: { ADD_NODE_MUTATION: { actions: [`markNodesDirty`, `callApi`] } },
    invoke: {
      id: `creating-pages`,
      src: `createPages`,
      onDone: {
        target: `rebuildingSchemaWithSitePage`,
        actions: `assignChangedPages`,
      },
      onError: genericOnError,
    },
  },
  rebuildingSchemaWithSitePage: {
    invoke: {
      src: `rebuildSchemaWithSitePage`,
      onDone: {
        target: `done`,
      },
      onError: genericOnError,
    },
  },
}

const doneState: StatesConfig<IDataLayerContext, any, any> = {
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
}

const options: Partial<MachineOptions<IDataLayerContext, any>> = {
  actions: dataLayerActions,
  services: dataLayerServices,
}

/**
 * Machine used during first run
 */

export const initializeDataMachine = Machine(
  {
    id: `initializeDataMachine`,
    context: {},
    initial: `customizingSchema`,
    states: {
      ...loadDataStates,
      ...initialCreatePagesStates,
      ...doneState,
    },
  },
  options
)

/**
 * Machine used when we need to source nodes again
 */

export const reloadDataMachine = Machine(
  {
    id: `reloadDataMachine`,
    context: {},
    initial: `customizingSchema`,
    states: {
      ...loadDataStates,
      ...recreatePagesStates,
      ...doneState,
    },
  },
  options
)

/**
 * Machine used when we need to re-create pages after a
 * node mutation outside of sourceNodes
 */
export const recreatePagesMachine = Machine(
  {
    id: `recreatePagesMachine`,
    context: {},
    initial: `buildingSchema`,
    states: {
      ...recreatePagesStates,
      ...doneState,
    },
  },
  options
)
