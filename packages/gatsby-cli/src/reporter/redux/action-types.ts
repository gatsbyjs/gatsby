import { Actions, ActivityStatuses, ActivityTypes } from "../constants"
import { IActivity } from "./reducer"
import { Dispatch, AnyAction } from "redux"

type DispatchAction = (dispatch: Dispatch<AnyAction>) => void

interface IActionReturn<T, P> {
  type: T
  payload: P
}

export type QueuedActionsToEmit<T, P> = Array<
  DispatchAction | IActionReturn<T, P>
>

export interface IStartActivityReturn {
  id: string
  uuid: string
  text: string
  type: string
  status: string
  startTime: [number, number]

  statusText: string

  current: string
  total: number
}

export interface ICreatePendingActivityReturn {
  id: string
  type: ActivityTypes.Pending
  status: string
}

export interface IEndActivityPending {
  id: string
  status: ActivityStatuses.Cancelled
  type: ActivityTypes.Pending
}

export interface IEndActivityInProgress {
  uuid: string
  id: string
  status: ActivityStatuses
  duration: number
  type: ActivityTypes.Spinner | ActivityTypes.Hidden | ActivityTypes.Progress
}

export interface ILogReturn {
  level: string
  text: string
  statusText?: string
  duration: number
  group?: string
  code?: string
  type?: string
  filePath?: string
  location?: string
  docsUrl?: string
  context?: string
  activity_current: string
  activity_total: number
  activity_type: string
  activity_uuid: string
  timestamp: string
  stack?: string
}

export interface IActionTypes {
  setStatus(status: string, force?: boolean): DispatchAction
  createLog(arg0: {
    text: string
    level: string
    duration: number
    group?: string
    code?: string
    type?: string
    filePath?: string
    location?: string
    docsUrl?: string
    context?: string
    statusText?: string
    activity_uuid: string
    activity_current: string
    activity_total: number
    activity_type: string
    stack?: string
  }): IActionReturn<Actions.Log, ILogReturn>

  startActivity: ({
    id,
    text,
    type,
    status,
    current,
    total,
  }: {
    id: string
    text: string
    type: string
    status?: ActivityStatuses
    current: string
    total: number
  }) => QueuedActionsToEmit<Actions.StartActivity, IStartActivityReturn>

  endActivity: ({
    id,
    status,
  }: {
    id: string
    status: ActivityStatuses
  }) => QueuedActionsToEmit<
    Actions.CancelActivity | Actions.EndActivity | Actions.Log,
    IEndActivityPending | IEndActivityInProgress | ILogReturn
  > | null

  createPendingActivity: ({
    id,
    status,
  }: {
    id: string
    status?: ActivityStatuses
  }) => QueuedActionsToEmit<
    Actions.PendingActivity,
    ICreatePendingActivityReturn
  >

  updateActivity: (
    activity: Partial<IActivity>
  ) => IActionReturn<Actions.UpdateActivity, Partial<IActivity>> | null

  setActivityErrored: ({
    id,
  }: {
    id: string
  }) => IActionReturn<Actions.ActivityErrored, { id: IActivity["id"] }> | null

  setActivityStatusText: ({
    id,
    statusText,
  }: {
    id: string
    statusText: string
  }) => IActionReturn<
    Actions.UpdateActivity,
    { id?: string; statusText?: string }
  > | null

  setActivityTotal: ({
    id,
    total,
  }: {
    id: string
    total: number
  }) => IActionReturn<
    Actions.UpdateActivity,
    { id?: string; total?: number }
  > | null

  activityTick: ({
    id,
    increment,
  }: {
    id: string
    increment?: number
  }) => IActionReturn<
    Actions.UpdateActivity,
    { id?: string; current?: string }
  > | null
}
