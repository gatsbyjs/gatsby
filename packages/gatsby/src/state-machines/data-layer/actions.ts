import { assign, DoneInvokeEvent, ActionFunctionMap } from "xstate"
import { createGraphQLRunner } from "../../bootstrap/create-graphql-runner"
import reporter from "gatsby-cli/lib/reporter"
import { IDataLayerContext } from "./types"
import { callApi, markNodesDirty } from "../develop/actions"
import { assertStore } from "../../utils/assert-store"
import { GraphQLRunner } from "../../query/graphql-runner"

const concatUnique = <T>(array1: T[] = [], array2: T[] = []): T[] =>
  Array.from(new Set(array1.concat(array2)))

export const assignChangedPages = assign<
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

export const assignGraphQLRunners = assign<IDataLayerContext>(
  ({ store, program }) => {
    assertStore(store)
    return {
      gatsbyNodeGraphQLFunction: createGraphQLRunner(store, reporter),
      graphqlRunner: new GraphQLRunner(store, {
        collectStats: true,
        graphqlTracing: program?.graphqlTracing,
      }),
    }
  }
)

export const dataLayerActions: ActionFunctionMap<IDataLayerContext, any> = {
  assignChangedPages,
  assignGraphQLRunners,
  callApi,
  markNodesDirty,
}
