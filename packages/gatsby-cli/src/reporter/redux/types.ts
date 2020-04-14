import { Actions, ActivityStatuses, ActivityTypes } from "../constants"

export interface IGatsbyCLIState {
  messages: ILog[]
  activities: {
    [id: string]: IActivity
  }
  status: string
}

export type ActionsUnion =
  | ICreateLog
  | ISetStatus
  | IEndActivity
  | IPendingActivity
  | IStartActivity
  | ICancelActivity
  | IUpdateActivity
  | IActivityErrored
  | ISetLogs

export interface IActivity {
  startTime?: [number, number]
  id: string
  uuid: string
  text: string
  type: ActivityTypes
  status: ActivityStatuses
  statusText: string
  current: number
  total: number
  duration?: number
  errored?: boolean
}

interface ILog {
  level: string
  text: string | undefined
  statusText: string | undefined
  duration: number
  group: string | undefined
  code: string | undefined
  type: string | undefined
  filePath: string | undefined
  location: string | undefined
  docsUrl: string | undefined
  context: string | undefined
  activity_current: number
  activity_total: number
  activity_type: string
  activity_uuid: string
  timestamp: string
  stack: string | undefined
}

export interface ICreateLog {
  type: Actions.Log
  payload: ILog
}

export interface ISetStatus {
  type: Actions.SetStatus
  payload: string
}

export interface IPendingActivity {
  type: Actions.PendingActivity
  payload: {
    id: string
    type: ActivityTypes
    status: ActivityStatuses
  }
}

export interface IStartActivity {
  type: Actions.StartActivity
  payload: IActivity
}

export interface ICancelActivity {
  type: Actions.CancelActivity
  payload: {
    id: string
    status: ActivityStatuses.Cancelled
    duration: number
    type: ActivityTypes
  }
}

export interface IEndActivity {
  type: Actions.EndActivity
  payload: {
    uuid: string
    id: string
    status: ActivityStatuses
    duration: number
    type: ActivityTypes
  }
}

export interface IUpdateActivity {
  type: Actions.UpdateActivity
  payload: {
    uuid: string
    id: string
    statusText?: string
    total?: number
    current?: number
  }
}

export interface IActivityErrored {
  type: Actions.ActivityErrored
  payload: {
    id: string
  }
}

export interface ISetLogs {
  type: Actions.SetLogs
  payload: IGatsbyCLIState
}
