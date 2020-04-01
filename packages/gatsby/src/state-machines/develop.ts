import {
  Machine,
  assign,
  DoneInvokeEvent,
  TransitionConfig,
  AnyEventObject,
} from "xstate"

import { initialize } from "../services/initialize"
import { customizeSchema } from "../services/customize-schema"
import { sourceNodes } from "../services/source-nodes"
import { buildSchema } from "../services/build-schema"
import { createPages } from "../services/create-pages"
import { createPagesStatefully } from "../services/create-pages-statefully"
import { calculateDirtyQueries } from "../services/calculate-dirty-queries"
import { extractQueries } from "../services/extract-queries"
import { runStaticQueries } from "../services/run-static-queries"
import { runPageQueries } from "../services/run-page-queries"
import { startWebpackServer } from "../services/start-webpack-server"
import { writeOutRequires } from "../services/write-out-requires"
import { WebsocketManager } from "../utils/websocket-manager"
import { waitUntilAllJobsComplete } from "../utils/wait-until-jobs-complete"
import { Store } from "../.."
import { actions } from "../redux/actions"
import { Compiler } from "webpack"

const MAX_RECURSION = 2
const NODE_MUTATION_BATCH_SIZE = 20
const NODE_MUTATION_BATCH_TIMEOUT = 5000

export interface IBuildContext {
  recursionCount: number
  nodesMutatedDuringQueryRun: boolean
  firstRun: boolean
  nodeMutationBatch: any[]
  filesDirty?: boolean
  runningBatch: any[]
  compiler?: Compiler
  websocketManager?: WebsocketManager
  store?: Store
}

const callRealApi = async (event, store?: Store): Promise<any> => {
  if (!store) {
    console.error(`No store`)
    return null
  }
  const { type, payload } = event
  if (type in actions) {
    return actions[type](...payload)(store.dispatch.bind(store))
  }
  // console.log(`Invalid type`, type)
  return null
}

const assignMutatedNodes = assign<any, DoneInvokeEvent<any>>(
  (context, event) => {
    return {
      nodesMutatedDuringQueryRun:
        context.nodesMutatedDuringQueryRun || event.data?.nodesMutated,
    }
  }
)

const context: IBuildContext = {
  recursionCount: 0,
  nodesMutatedDuringQueryRun: false,
  firstRun: true,
  nodeMutationBatch: [],
  runningBatch: [],
}

export const rageAgainstTheStateMachine = async (): Promise<void> => {
  console.error(`I won't do what you tell me!`)
}

const emitPageDataToWebsocket = (
  { websocketManager }: IBuildContext,
  { data: { results } }: DoneInvokeEvent<any>
): void => {
  if (results) {
    results.forEach((result, id) => {
      // eslint-disable-next-line no-unused-expressions
      websocketManager?.emitPageData({
        result,
        id,
      })
    })
  }
}

const emitStaticQueryDataToWebsocket = (
  { websocketManager }: IBuildContext,
  { data: { results } }: DoneInvokeEvent<any>
): void => {
  if (results) {
    results.forEach((result, id) => {
      // eslint-disable-next-line no-unused-expressions
      websocketManager?.emitStaticQueryData({
        result,
        id,
      })
    })
  }
}

/**
 * Event handler used in all states where we're not ready to process node
 * mutations. Instead we add it to a batch to process when we're next idle
 */
const ADD_NODE_MUTATION: TransitionConfig<IBuildContext, AnyEventObject> = {
  actions: assign((ctx, event) => {
    return {
      nodeMutationBatch: [...ctx.nodeMutationBatch, event.payload],
    }
  }),
}

/**
 * Event handler used in all states where we're not ready to process a file change
 * Instead we add it to a batch to process when we're next idle
 */
const SOURCE_FILE_CHANGED: TransitionConfig<IBuildContext, AnyEventObject> = {
  actions: assign((ctx, event) => {
    return {
      filesDirty: true,
    }
  }),
}

/**
 * When running queries we might add nodes (e.g from resolvers). If so we'll
 * want to re-run queries and schema inference
 */
const runMutationAndMarkDirty: TransitionConfig<
  IBuildContext,
  AnyEventObject
> = {
  actions: [
    assign<any, DoneInvokeEvent<any>>({
      nodesMutatedDuringQueryRun: true,
    }),
    async (ctx, event): Promise<void> =>
      // console.log(`calling real api and mareking dirty`)
      callRealApi(event.payload, ctx.store),
  ],
}

/**
 * Handler for when we're inside handlers that should be able to mutate nodes
 */
const skipDeferredApi: TransitionConfig<IBuildContext, AnyEventObject> = {
  actions: [
    async (ctx, event): Promise<void> => callRealApi(event.payload, ctx.store),
  ],
}

// eslint-disable-next-line new-cap
export const developMachine = Machine<any>(
  {
    id: `build`,
    initial: `initializing`,
    context,
    states: {
      initializing: {
        on: { ADD_NODE_MUTATION: skipDeferredApi },
        invoke: {
          src: initialize,
          onDone: {
            target: `customizingSchema`,
            actions: assign<any, DoneInvokeEvent<any>>((context, event) => {
              const { store, bootstrapSpan } = event.data
              return {
                // nodesMutatedDuringQueryRun:
                //   ctx.nodesMutatedDuringQueryRun || event.data.nodesMutated,
                // firstRun: false,
                store,
                parentSpan: bootstrapSpan,
              }
            }),
          },
          onError: {
            target: `failed`,
          },
        },
      },
      customizingSchema: {
        on: { ADD_NODE_MUTATION: skipDeferredApi },
        invoke: {
          src: customizeSchema,
          id: `customizing-schema`,
          onDone: {
            target: `sourcingNodes`,
          },
          onError: {
            target: `idle`,
          },
        },
      },
      sourcingNodes: {
        on: {
          ADD_NODE_MUTATION: skipDeferredApi,
        },
        invoke: {
          src: sourceNodes,
          id: `sourcing-nodes`,
          onDone: {
            target: `buildingSchema`,
          },
          onError: {
            target: `idle`,
          },
        },
      },
      buildingSchema: {
        on: { ADD_NODE_MUTATION: skipDeferredApi },
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
            target: `idle`,
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
              target: `extractingQueries`,
              actions: assignMutatedNodes,
            },
          ],
          onError: {
            target: `idle`,
          },
        },
      },
      extractingQueries: {
        on: { ADD_NODE_MUTATION },
        invoke: {
          id: `extracting-queries`,
          src: extractQueries,
          onDone: [
            {
              target: `writingRequires`,
            },
          ],
          onError: {
            target: `idle`,
          },
        },
      },
      writingRequires: {
        on: {
          ADD_NODE_MUTATION,
          SOURCE_FILE_CHANGED,
        },
        invoke: {
          src: writeOutRequires,
          id: `writing-requires`,
          onDone: {
            target: `calculatingDirtyQueries`,
          },
          onError: {
            target: `failed`,
          },
        },
      },
      calculatingDirtyQueries: {
        on: {
          "": [
            {
              cond: (ctx): boolean => ctx.filesDirty,
              target: `extractingQueries`,
            },
          ],
          ADD_NODE_MUTATION,
          SOURCE_FILE_CHANGED,
        },
        invoke: {
          id: `calculating-dirty-queries`,
          src: calculateDirtyQueries,
          onDone: [
            {
              target: `runningStaticQueries`,
              actions: assign<any, DoneInvokeEvent<any>>(
                (context, { data }) => {
                  const { queryIds } = data
                  return {
                    filesDirty: false,
                    queryIds,
                  }
                }
              ),
            },
          ],
          onError: {
            target: `idle`,
          },
        },
      },
      creatingPagesStatefully: {
        on: {
          "": [
            {
              cond: (ctx): boolean => ctx.filesDirty,
              target: `extractingQueries`,
            },
          ],
          ADD_NODE_MUTATION: runMutationAndMarkDirty,
          SOURCE_FILE_CHANGED,
        },
        invoke: {
          src: createPagesStatefully,
          id: `creating-pages-statefully`,
          onDone: {
            target: `extractingQueries`,
          },
          onError: {
            target: `idle`,
          },
        },
      },
      runningStaticQueries: {
        on: {
          "": [
            {
              cond: (ctx): boolean => ctx.filesDirty,
              target: `extractingQueries`,
            },
          ],
          ADD_NODE_MUTATION: runMutationAndMarkDirty,
          SOURCE_FILE_CHANGED,
        },
        invoke: {
          src: runStaticQueries,
          id: `running-static-queries`,
          onDone: {
            target: `runningPageQueries`,
            actions: [emitStaticQueryDataToWebsocket],
          },
          onError: {
            target: `idle`,
          },
        },
      },
      runningPageQueries: {
        on: {
          "": [
            {
              cond: (ctx): boolean => ctx.filesDirty,
              target: `extractingQueries`,
            },
          ],
          ADD_NODE_MUTATION: runMutationAndMarkDirty,
          SOURCE_FILE_CHANGED,
        },
        invoke: {
          src: runPageQueries,
          id: `running-page-queries`,
          onDone: [
            {
              target: `checkingForMutatedNodes`,
              actions: [emitPageDataToWebsocket],
            },
          ],
          onError: {
            target: `idle`,
          },
        },
      },
      checkingForMutatedNodes: {
        on: {
          "": [
            // Nothing was mutated. Moving to next state
            {
              target: `waitingForJobs`,
              cond: (context): boolean => !context.nodesMutatedDuringQueryRun,
            },
            // Nodes were mutated. Starting again.
            {
              actions: assign(context => {
                return {
                  recursionCount: context.recursionCount + 1,
                  nodesMutatedDuringQueryRun: false, // Resetting
                }
              }),
              target: `customizingSchema`,
              cond: (ctx): boolean => ctx.recursionCount < MAX_RECURSION,
            },
            // We seem to be stuck in a loop. Bailing.
            {
              actions: [
                assign(() => {
                  return {
                    recursionCount: 0,
                    nodesMutatedDuringQueryRun: false, // Resetting
                  }
                }),
                {
                  type: `rage-against-the-state-machine`,
                },
              ],
              target: `idle`,
            },
          ],
        },
      },
      waitingForJobs: {
        on: {
          ADD_NODE_MUTATION,
          SOURCE_FILE_CHANGED,
        },
        invoke: {
          src: waitUntilAllJobsComplete,
          id: `waiting-for-jobs`,
          onDone: [
            {
              target: `runningWebpack`,
              cond: (ctx): boolean => ctx.firstRun,
            },
            {
              target: `idle`,
            },
          ],
          onError: {
            target: `idle`,
          },
        },
      },

      // writingArtifacts: {
      //   invoke: {
      //     src: writingArtifacts,
      //     id: `writing-artifacts`,
      //     onDone: {
      //       target: `idle`,
      //     },
      //     onError: {
      //       target: `idle`,
      //     },
      //   },
      // },

      // batchingPageMutations: {
      //   invoke: {
      //     src: batchingPageMutations,
      //     id: `batchingPageMutations`,
      //     onDone: {
      //       target: `runningStaticQueries`,
      //     },
      //     onError: {
      //       target: `idle`,
      //     },
      //   },
      // },

      runningWebpack: {
        on: {
          ADD_NODE_MUTATION,
          SOURCE_FILE_CHANGED,
        },
        invoke: {
          src: startWebpackServer,
          id: `running-webpack`,
          onDone: {
            target: `idle`,
            actions: assign((context, { data }) => {
              const { compiler, websocketManager } = data
              return {
                compiler,
                firstRun: false,
                websocketManager,
              }
            }),
          },
          onError: {
            target: `failed`,
          },
        },
      },

      // There is an empty bus and doors are closed
      idle: {
        entry: [
          assign({
            webhookBody: null,
            refresh: false,
            recursionCount: 0,
            nodesMutatedDuringQueryRun: false,
          }),
        ],
        on: {
          "": [
            // Node mutations are prioritised because we don't want
            // to run queries on data that is stale
            {
              cond: (ctx): boolean => !!ctx.nodeMutationBatch.length,
              target: `batchingNodeMutations`,
            },
            {
              cond: (ctx): boolean => ctx.filesDirty,
              target: `extractingQueries`,
            },
          ],
          WEBHOOK_RECEIVED: {
            target: `refreshing`,
            actions: assign((ctx, event) => {
              return { webhookBody: event.body }
            }),
          },
          ADD_NODE_MUTATION: {
            ...ADD_NODE_MUTATION,
            target: `batchingNodeMutations`,
          },
          SOURCE_FILE_CHANGED: {
            target: `extractingQueries`,
          },
        },
      },

      refreshing: {
        on: { ADD_NODE_MUTATION },
        invoke: {
          src: async (ctx, event): Promise<void> => {},
          id: `refreshing`,
          onDone: {
            target: `customizingSchema`,
            actions: assign({
              refresh: true,
            }),
          },
          onError: {
            target: `failed`,
          },
        },
      },

      // Doors are open for people to enter
      batchingNodeMutations: {
        on: {
          // Check if the batch is already full on entry
          "": {
            cond: (ctx): boolean =>
              ctx.nodeMutationBatch?.length >= NODE_MUTATION_BATCH_SIZE,
            target: `committingBatch`,
          },
          // More people enter same bus
          ADD_NODE_MUTATION: [
            // If this fills the batch then commit it
            {
              ...ADD_NODE_MUTATION,
              cond: (ctx): boolean =>
                ctx.nodeMutationBatch?.length >= NODE_MUTATION_BATCH_SIZE,
              target: `committingBatch`,
            },
            // otherwise just add it to the batch
            ADD_NODE_MUTATION,
          ],
        },

        // Check if bus is either full or if enough time has passed since
        // first passenger entered the bus

        // Fallback
        after: {
          [NODE_MUTATION_BATCH_TIMEOUT]: `committingBatch`,
        },
      },
      committingBatch: {
        on: { ADD_NODE_MUTATION },
        entry: [
          assign(context => {
            // console.log(
            //   `context at entry for committing batch`,
            //   context.runningBatch,
            //   context.nodeMutationBatch
            // )
            // Move the contents of the batch into a batch for running
            return {
              target: `buildingSchema`,
              nodeMutationBatch: [],
              runningBatch: context.nodeMutationBatch,
            }
          }),
        ],
        invoke: {
          src: async ({ runningBatch, store }): Promise<any> =>
            // Consume the entire batch and run actions
            Promise.all(
              runningBatch.map(payload => callRealApi(payload, store))
            ),
          onDone: {
            target: `buildingSchema`,
            actions: assign({
              runningBatch: [],
            }),
          },
        },
      },

      failed: {
        invoke: {
          src: async (context, event): Promise<void> => {
            console.error(event)
          },
        },
      },
    },
  },
  {
    actions: {
      "rage-against-the-state-machine": rageAgainstTheStateMachine,
    },
  }
)
