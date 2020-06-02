import {
  AnyEventObject,
  ServiceConfig,
  MachineConfig,
  ActionFunctionMap,
  StateSchema,
} from "xstate"
import { IBuildContext } from "./src/services"
export { GraphQLRunner } from "./src/query/graphql-runner"
export { IMutationAction, IGroupedQueryIds } from "./src/services"
export { IProgram } from "./src/commands/types"

export const buildServices: Record<string, ServiceConfig<IBuildContext>>
export const INITIAL_CONTEXT: IBuildContext
export const idleStates: MachineConfig<
  IBuildContext,
  StateSchema,
  AnyEventObject
>
export const runningStates: MachineConfig<
  IBuildContext,
  StateSchema,
  AnyEventObject
>
export const buildActions: ActionFunctionMap<IBuildContext, AnyEventObject>
export { IBuildContext }
