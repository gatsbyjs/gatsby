import {
  assign,
  AnyEventObject,
  ActionFunction,
  AssignAction,
  DoneInvokeEvent,
  ActionFunctionMap,
} from "xstate"
import { createGraphQLRunner } from "../../bootstrap/create-graphql-runner"
import reporter from "gatsby-cli/lib/reporter"
import { IDataLayerContext } from "./types"
import { assertStore } from "../../utils/assert-store"

const concatUnique = <T>(array1: T[] = [], array2: T[] = []): T[] =>
  Array.from(new Set(array1.concat(array2)))

type BuildMachineAction =
  | ActionFunction<IDataLayerContext, any>
  | AssignAction<IDataLayerContext, any>

export const assignChangedPages: BuildMachineAction = assign<
  IDataLayerContext,
  DoneInvokeEvent<{
    changedPages: string[]
    deletedPages: string[]
  }>
>((context, event) => {
  return {
    pagesToBuild: concatUnique(context.pagesToBuild, event.data.changedPages),
    pagesToDelete: concatUnique(context.pagesToDelete, event.data.deletedPages),
  }
})

export const assignGatsbyNodeGraphQL: BuildMachineAction = assign<
  IDataLayerContext
>({
  gatsbyNodeGraphQLFunction: ({ store }: IDataLayerContext) => {
    assertStore(store)
    return createGraphQLRunner(store, reporter)
  },
})

export const dataLayerActions: ActionFunctionMap<
  IDataLayerContext,
  AnyEventObject
> = {
  assignChangedPages,
  assignGatsbyNodeGraphQL,
}
