import { IQueryRunningContext } from "./types"
import {
  DoneInvokeEvent,
  assign,
  ActionFunctionMap,
  AnyEventObject,
} from "xstate"
import { enqueueFlush } from "../../utils/page-data"

export const flushPageData = (context: IQueryRunningContext): void => {
  enqueueFlush(context.parentSpan)
}

export const assignDirtyQueries = assign<
  IQueryRunningContext,
  DoneInvokeEvent<any>
>((_context, { data }) => {
  const { queryIds } = data
  return {
    queryIds,
  }
})

export const markSourceFilesDirty = assign<IQueryRunningContext>({
  filesDirty: true,
})

export const markSourceFilesClean = assign<IQueryRunningContext>({
  filesDirty: false,
})

export const trackRequestedQueryRun = assign<
  IQueryRunningContext,
  AnyEventObject
>({
  pendingQueryRuns: (context, { payload }) => {
    const pendingQueryRuns = context.pendingQueryRuns || new Set<string>()
    if (payload?.pagePath) {
      pendingQueryRuns.add(payload.pagePath)
    }
    return pendingQueryRuns
  },
})

export const clearCurrentlyHandledPendingQueryRuns =
  assign<IQueryRunningContext>({
    currentlyHandledPendingQueryRuns: undefined,
  })

export const queryActions: ActionFunctionMap<IQueryRunningContext, any> = {
  assignDirtyQueries,
  flushPageData,
  markSourceFilesDirty,
  markSourceFilesClean,
  trackRequestedQueryRun,
  clearCurrentlyHandledPendingQueryRuns,
}
