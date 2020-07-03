import { IQueryRunningContext } from "./types"
import { DoneInvokeEvent, assign, ActionFunctionMap } from "xstate"
import { GraphQLRunner } from "../../query/graphql-runner"
import { assertStore } from "../../utils/assert-store"
import { enqueueFlush } from "../../utils/page-data"

export const emitStaticQueryDataToWebsocket = (
  { websocketManager }: IQueryRunningContext,
  { data: { results } }: DoneInvokeEvent<any>
): void => {
  if (websocketManager && results) {
    results.forEach((result, id) => {
      websocketManager.emitStaticQueryData({
        result,
        id,
      })
    })
  }
}

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
  emitStaticQueryDataToWebsocket,
  flushPageData,
}
