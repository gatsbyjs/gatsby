import { IQueryRunningContext } from "./types"
import { DoneInvokeEvent, assign, ActionFunctionMap } from "xstate"
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
    queryIds,
  }
})

export const markSourceFilesDirty = assign<IQueryRunningContext>({
  filesDirty: true,
})

export const markSourceFilesClean = assign<IQueryRunningContext>({
  filesDirty: false,
})

export const queryActions: ActionFunctionMap<IQueryRunningContext, any> = {
  assignDirtyQueries,
  flushPageData,
  markSourceFilesDirty,
  markSourceFilesClean,
}
