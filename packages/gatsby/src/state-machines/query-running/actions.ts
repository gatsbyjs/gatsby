import { IQueryRunningContext } from "./types"
import { DoneInvokeEvent, assign, ActionFunctionMap } from "xstate"

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

export const emitPageDataToWebsocket = (
  { websocketManager }: IQueryRunningContext,
  { data: { results } }: DoneInvokeEvent<any>
): void => {
  if (websocketManager && results) {
    results.forEach((result, id) => {
      websocketManager.emitPageData({
        result,
        id,
      })
    })
  }
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

export const queryActions: ActionFunctionMap<
  IQueryRunningContext,
  DoneInvokeEvent<any>
> = {
  assignDirtyQueries,
  emitPageDataToWebsocket,
  emitStaticQueryDataToWebsocket,
}
