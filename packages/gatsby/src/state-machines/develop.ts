import { Machine, assign, DoneInvokeEvent } from "xstate"

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

import { waitUntilAllJobsComplete } from "../utils/wait-until-jobs-complete"

const MAX_RECURSION = 2

interface IBuildContext {
  recursionCount: number
  nodesMutatedDuringQueryRun: boolean
  firstRun: boolean
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
}

export const rageAgainstTheStateMachine = async (): Promise<void> => {
  console.error(`I won't do what you tell me!`)
}

// eslint-disable-next-line new-cap
export const developMachine = Machine<any>(
  {
    id: `build`,
    initial: `initializing`,
    context,
    states: {
      initializing: {
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
        invoke: {
          id: `creating-pages`,
          src: createPages,
          onDone: [
            {
              target: `creatingPagesStatefully`,
              cond: (context): boolean => context.firstRun,
              actions: assign<any, DoneInvokeEvent<any>>((context, event) => {
                return {
                  // TODO: Get this correctly from createPages
                  nodesMutatedDuringQueryRun:
                    context.nodesMutatedDuringQueryRun ||
                    !!event.data?.nodesMutated,
                  firstRun: false,
                }
              }),
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
      calculatingDirtyQueries: {
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
        invoke: {
          src: runStaticQueries,
          id: `running-static-queries`,
          onDone: {
            target: `runningPageQueries`,
          },
          onError: {
            target: `idle`,
          },
        },
      },
      runningPageQueries: {
        invoke: {
          src: runPageQueries,
          id: `running-page-queries`,
          onDone: [
            {
              target: `waitingForJobs`,
              // cond: (context, event): boolean => {
              //   return !(
              //     context.nodesMutatedDuringQueryRun || event.data?.nodesMutated
              //   )
              // },
            },
            // {
            //   actions: assign(ctx => {
            //     return {
            //       ...ctx,
            //       recursionCount: ctx.recursionCount + 1,
            //       // nodesMutatedDuringQueryRun: false, // Resetting
            //     }
            //   }),
            //   target: `customizingSchema`,
            //   cond: (ctx: IBuildContext): boolean =>
            //     ctx.recursionCount < MAX_RECURSION,
            // },
            // {
            //   actions: [
            //     assign(ctx => {
            //       return {
            //         ...ctx,
            //         recursionCount: 0,
            //         // nodesMutatedDuringQueryRun: false, // Resetting
            //       }
            //     }),
            //     {
            //       type: `rage-against-the-state-machine`,
            //     },
            //   ],
            //   target: `idle`,
            // },
          ],
          onError: {
            // actions: assign(ctx => {
            //   return {
            //     ...ctx,
            //     recursionCount: 0,
            //     // nodesMutatedDuringQueryRun: false, // Resetting
            //   }
            // }),
            target: `idle`,
          },
        },
      },
      waitingForJobs: {
        invoke: {
          src: waitUntilAllJobsComplete,
          id: `waiting-for-jobs`,
          onDone: {
            target: `runningWebpack`,
          },
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
      // transactionRunning: {
      //   invoke: {
      //     src: transactionRunning,
      //     id: `transactionRunning`,
      //     onDone: {
      //       target: `customizingSchema`,
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

      writingRequires: {
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

      runningWebpack: {
        invoke: {
          src: startWebpackServer,
          id: `running-webpack`,
          onDone: {
            target: `idle`,
            actions: assign<any, DoneInvokeEvent<any>>((context, { data }) => {
              const { compiler } = data
              return {
                compiler,
              }
            }),
          },
          onError: {
            target: `failed`,
          },
        },
      },

      idle: {
        // on: {
        //   WEBHOOK_RECEIVED: {
        //     target: `transactionRunning`,
        //   },
        //   ENQUEUE_NODE_MUTATION: {
        //     target: `transactionRunning`,
        //   },
        //   ENQUEUE_PAGE_MUTATION: {
        //     target: `batchingPageMutations`,
        //   },
        //   CREATE_TRANSACTION: {
        //     target: `transactionRunning`,
        //   },
        // },
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
