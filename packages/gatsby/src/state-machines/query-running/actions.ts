import { IQueryRunningContext } from "./types"
import { DoneInvokeEvent, assign, ActionFunctionMap } from "xstate"
import { GraphQLRunner } from "../../query/graphql-runner"
import { assertStore } from "../../utils/assert-store"
import { enqueueFlush } from "../../utils/page-data"

export const flushPageData = (): void => {
  enqueueFlush()
}

export const assignDirtyQueries = assign<
  IQueryRunningContext,
  DoneInvokeEvent<any>
>((_context, { data }) => {
  const { queryIds } = data
  return {
    filesDirty: false,
    queryIds,
  }
})

export const resetGraphQLRunner = assign<
  IQueryRunningContext,
  DoneInvokeEvent<any>
>({
  graphqlRunner: ({ store, program }) => {
    assertStore(store)
    return new GraphQLRunner(store, {
      collectStats: true,
      graphqlTracing: program?.graphqlTracing,
    })
  },
})

export const queryActions: ActionFunctionMap<
  IQueryRunningContext,
  DoneInvokeEvent<any>
> = {
  resetGraphQLRunner,
  assignDirtyQueries,
  flushPageData,
}
