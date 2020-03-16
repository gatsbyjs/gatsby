import { Actions, ActivityStatuses } from "../constants"
import { IActivity } from "./reducer"
import { Dispatch, AnyAction } from "redux"

type DispatchAction = (dispatch: Dispatch<AnyAction>) => void

export type QueuedActionsToEmit<T> = Array<
  DispatchAction | { type: T; payload: Partial<IActivity> }
>

export interface IActionTypes {
  setStatus(status: string, force?: boolean | undefined): DispatchAction
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
  }): {
    type: Actions.Log
    payload: {
      level: string
      text: string
      statusText: string | undefined
      duration: number
      group: string | undefined
      code: string | undefined
      type: string | undefined
      filePath: string | undefined
      location: string | undefined
      docsUrl: string | undefined
      context: string | undefined
      activity_current: string
      activity_total: number
      activity_type: string
      activity_uuid: string
      timestamp: string
      stack: string | undefined
    }
  }

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
    status?: ActivityStatuses | undefined
    current: string
    total: number
  }) => QueuedActionsToEmit<Actions.StartActivity>

  endActivity: ({
    id,
    status,
  }: {
    id: string
    status: ActivityStatuses
  }) => QueuedActionsToEmit<
    Actions.CancelActivity | Actions.EndActivity | Actions.Log
  > | null

  createPendingActivity: ({
    id,
    status,
  }: {
    id: string
    status?: ActivityStatuses | undefined
  }) => QueuedActionsToEmit<Actions.PendingActivity>

  updateActivity: (
    activity: Partial<IActivity>
  ) => {
    type: Actions.UpdateActivity
    payload: Partial<IActivity>
  } | null

  setActivityErrored: ({
    id,
  }: {
    id: string
  }) => {
    type: Actions.ActivityErrored
    payload: {
      id: IActivity["id"]
    }
  } | null

  setActivityStatusText: ({
    id,
    statusText,
  }: {
    id: string
    statusText: string
  }) => {
    type: Actions.UpdateActivity
    payload: Partial<IActivity>
  } | null

  setActivityTotal: ({
    id,
    total,
  }: {
    id: string
    total: number
  }) => {
    type: Actions.UpdateActivity
    payload: Partial<IActivity>
  } | null

  activityTick: ({
    id,
    increment,
  }: {
    id: string
    increment?: number | undefined
  }) => {
    type: Actions.UpdateActivity
    payload: Partial<IActivity>
  } | null
}
