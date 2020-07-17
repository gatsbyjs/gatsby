import { IQueryRunningContext } from "./types"
import { DoneInvokeEvent, assign, ActionFunctionMap } from "xstate"
import { enqueueFlush } from "../../utils/page-data"
import { boundActionCreators } from "../../redux/actions"
import { ProgramStatus } from "../../redux/types"

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

const finishUpQueries = async (): Promise<void> => {
  boundActionCreators.setProgramStatus(
    ProgramStatus.BOOTSTRAP_QUERY_RUNNING_FINISHED
  )
}

export const queryActions: ActionFunctionMap<
  IQueryRunningContext,
  DoneInvokeEvent<any>
> = {
  assignDirtyQueries,
  flushPageData,
  finishUpQueries,
}
