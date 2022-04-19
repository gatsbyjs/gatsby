import _ from "lodash"
import type { DoneInvokeEvent } from "xstate"
import { createMachine, actions } from "xstate"
import type { GraphQLSchema } from "graphql"
import type { IDefinitionMeta, FragmentDefinition } from "./utils"
import {
  stabilizeSchema,
  definitionIsEqual,
  isTargetDefinition,
  isThirdpartyFragment,
} from "./utils"

type DefinitionName = string
type DefinitionMap = Map<DefinitionName, IDefinitionMeta>

interface IContext {
  debouncingDelay: number
  devMode: boolean
  trackedDefinitions?: DefinitionMap
  thirdpartyFragments?: Array<FragmentDefinition>
  schema?: GraphQLSchema
}

type Event =
  | { type: "SET_SCHEMA"; schema: GraphQLSchema }
  | { type: "SET_GRAPHQL_DEFINITIONS"; definitions: DefinitionMap }
  | { type: "CREATE_DEV_SERVER" }
  | { type: "CHANGE_SCHEMA"; schema: GraphQLSchema }
  | { type: "CHANGE_GRAPHQL_DEFINITIONS"; definitions: DefinitionMap }
  | { type: "CHECK_IF_READY" }
  | { type: "START_EMIT_SCHEMA"; schema: GraphQLSchema }
  | { type: "DONE_EMIT_SCHEMA" }
  | { type: "START_CODEGEN"; schema: GraphQLSchema; definitions: DefinitionMap }
  | { type: "DONE_CODEGEN" }

type PickEvent<T extends Event["type"]> = Extract<Event, { type: T }>

export const typegenMachine = createMachine(
  {
    // @ts-ignore - FIXME
    tsTypes: {},
    schema: {
      context: {} as IContext,
      events: {} as Event,
    },
    initial: `initializing`,
    on: {
      CREATE_DEV_SERVER: {
        actions: `assignDevMode`,
      },
    },
    states: {
      initializing: {
        type: `parallel`,
        on: {
          SET_SCHEMA: {
            actions: [
              `assignSchema`,
              actions.send<IContext, PickEvent<"SET_SCHEMA">>(`CHECK_IF_READY`),
            ],
          },
          SET_GRAPHQL_DEFINITIONS: {
            actions: [
              `assignThirdpartyDefinitions`,
              `assignDefinitions`,
              actions.send<IContext, PickEvent<"SET_GRAPHQL_DEFINITIONS">>(
                `CHECK_IF_READY`
              ),
            ],
          },
          CHECK_IF_READY: {
            cond: `ready?`,
            target: `runningOnce`,
          },
        },
      },
      runningOnce: {
        initial: `running`,
        states: {
          running: {
            type: `parallel`,
            states: {
              emitSchema: {
                initial: `running`,
                states: {
                  running: {
                    invoke: {
                      src: `emitSchema`,
                      onDone: `done`,
                      onError: {
                        target: `done`,
                        actions: `reportEmitSchemaError`,
                      },
                    },
                  },
                  done: {
                    type: `final`,
                  },
                },
              },
              emitPluginDocument: {
                initial: `running`,
                states: {
                  running: {
                    invoke: {
                      src: `emitPluginDocument`,
                      onDone: `done`,
                      onError: {
                        target: `done`,
                        actions: `reportEmitPluginDocumentError`,
                      },
                    },
                  },
                  done: {
                    type: `final`,
                  },
                },
              },
              codegen: {
                initial: `running`,
                states: {
                  running: {
                    invoke: {
                      src: `codegen`,
                      onDone: `done`,
                      onError: {
                        target: `done`,
                        actions: `reportCodegenError`,
                      },
                    },
                  },
                  done: {
                    type: `final`,
                  },
                },
              },
            },
            onDone: [
              {
                cond: `devMode?`,
                target: `#watching`,
              },
              {
                target: `idle`,
              },
            ],
          },
          idle: {
            on: {
              CREATE_DEV_SERVER: `#watching`,
            },
          },
        },
      },
      watching: {
        type: `parallel`,
        id: `watching`,
        states: {
          schedulers: {
            on: {
              SET_SCHEMA: {
                cond: `hasSchemaChanged?`,
                actions: `onSchemaChange`,
              },
              CHANGE_SCHEMA: {
                actions: `assignSchema`,
              },
              SET_GRAPHQL_DEFINITIONS: {
                cond: `hasDefinitionsChanged?`,
                actions: `onDefinitionsChange`,
              },
              CHANGE_GRAPHQL_DEFINITIONS: {
                actions: `assignDefinitions`,
              },
            },
          },
          jobs: {
            type: `parallel`,
            states: {
              emitSchema: {
                initial: `idle`,
                states: {
                  idle: {
                    on: {
                      START_EMIT_SCHEMA: `running`,
                    },
                  },
                  running: {
                    invoke: {
                      src: `emitSchema`,
                      onDone: {
                        target: `idle`,
                        actions: actions.send<
                          IContext,
                          DoneInvokeEvent<unknown>
                        >(`DONE_EMIT_SCHEMA`),
                      },
                      onError: {
                        target: `idle`,
                        actions: [
                          `reportEmitSchemaError`,
                          actions.send<IContext, DoneInvokeEvent<unknown>>(
                            `DONE_EMIT_SCHEMA`
                          ),
                        ],
                      },
                    },
                  },
                },
              },
              codegen: {
                initial: `idle`,
                states: {
                  idle: {
                    on: {
                      START_CODEGEN: `running`,
                    },
                  },
                  running: {
                    invoke: {
                      src: `codegen`,
                      onDone: {
                        target: `idle`,
                        actions: actions.send<
                          IContext,
                          DoneInvokeEvent<unknown>
                        >(`DONE_CODEGEN`),
                      },
                      onError: {
                        target: `idle`,
                        actions: [
                          `reportCodegenError`,
                          actions.send<IContext, DoneInvokeEvent<unknown>>(
                            `DONE_CODEGEN`
                          ),
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  {
    guards: {
      "devMode?": context => Boolean(context.devMode),
      "ready?": context =>
        Boolean(
          context.schema &&
            context.trackedDefinitions &&
            context.thirdpartyFragments
        ),
      "hasSchemaChanged?": (context, event) => context.schema !== event.schema,
      "hasDefinitionsChanged?": (context, event) => {
        const changes = _.differenceWith(
          [...(context.trackedDefinitions?.values() || [])],
          extractTargetDefinitions(event.definitions),
          definitionIsEqual
        )
        return changes.length !== 0
      },
    },
    actions: {
      assignDevMode: actions.assign({
        devMode: _context => true,
      }),
      assignSchema: actions.assign({
        schema: (_context, event) => stabilizeSchema(event.schema),
      }),
      assignThirdpartyDefinitions: actions.assign({
        thirdpartyFragments: (_context, event) =>
          extractThirdpartyDefinitions(event.definitions),
      }),
      assignDefinitions: actions.assign({
        trackedDefinitions: (_context, event) =>
          filterTargetDefinitions(event.definitions),
      }),
      onSchemaChange: actions.pure((_context, event) => {
        const { schema } = event

        const emitSchemaJobId = `SCHEDULED_emitSchema`

        return [
          actions.send({ type: `CHANGE_SCHEMA`, schema }),

          actions.cancel(emitSchemaJobId),
          actions.send<IContext, PickEvent<"SET_SCHEMA">>(
            { type: `START_EMIT_SCHEMA`, schema },
            {
              id: emitSchemaJobId,
              delay: context => context.debouncingDelay,
            }
          ),
        ]
      }),
      onDefinitionsChange: actions.pure((context, event) => {
        const { schema, debouncingDelay } = context
        const { definitions } = event

        const codegenJobId = `SCHEDULED_codegen`

        return [
          actions.send({ type: `CHANGE_GRAPHQL_DEFINITIONS`, definitions }),

          actions.cancel(codegenJobId),
          actions.send<IContext, PickEvent<"SET_GRAPHQL_DEFINITIONS">>(
            { type: `START_CODEGEN`, schema, definitions },
            {
              id: codegenJobId,
              delay: debouncingDelay,
            }
          ),
        ]
      }),
    },
  }
)

function extractThirdpartyDefinitions(
  defMap: DefinitionMap
): Array<FragmentDefinition> {
  return [...defMap.values()].filter(isThirdpartyFragment)
}

function extractTargetDefinitions(
  defMap: DefinitionMap
): Array<IDefinitionMeta> {
  return [...defMap.values()].filter(isTargetDefinition)
}

function filterTargetDefinitions(
  defMap: DefinitionMap
): Map<string, IDefinitionMeta> {
  const defs: Array<[name: string, def: IDefinitionMeta]> = []
  for (const [name, def] of defMap) {
    if (isTargetDefinition(def)) {
      defs.push([name, def])
    }
  }
  return new Map(defs)
}
