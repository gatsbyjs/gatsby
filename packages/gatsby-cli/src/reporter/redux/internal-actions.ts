import { uuid } from "gatsby-core-utils"
import signalExit from "signal-exit"
import { Dispatch } from "redux"

import { getStore } from "./"
import {
  Actions,
  ActivityLogLevels,
  ActivityStatuses,
  ActivityTypes,
} from "../constants"
import {
  IPendingActivity,
  ICreateLog,
  ISetStatus,
  IStartActivity,
  ICancelActivity,
  IEndActivity,
  IUpdateActivity,
  IActivityErrored,
  IGatsbyCLIState,
  ISetLogs,
  IRenderPageTree,
} from "./types"
import {
  delayedCall,
  getActivity,
  getElapsedTimeMS,
  getGlobalStatus,
} from "./utils"
import { IStructuredError, ErrorCategory } from "../../structured-errors/types"
import { IRenderPageArgs } from "../types"

const ActivityStatusToLogLevel = {
  [ActivityStatuses.Interrupted]: ActivityLogLevels.Interrupted,
  [ActivityStatuses.Failed]: ActivityLogLevels.Failed,
  [ActivityStatuses.Success]: ActivityLogLevels.Success,
}

let weShouldExit = false
signalExit(() => {
  weShouldExit = true
})

let cancelDelayedSetStatus: (() => void) | null

let pendingStatus: ActivityStatuses | "" = ``

// We debounce "done" statuses because activities don't always overlap
// and there is timing window after one activity ends and before next one starts
// where technically we are "done" (all activities are done).
// We don't want to emit multiple SET_STATUS events that would toggle between
// IN_PROGRESS and SUCCESS/FAILED in short succession in those cases.
export const setStatus =
  (status: ActivityStatuses | "", force: boolean = false) =>
  (dispatch: Dispatch<ISetStatus>): void => {
    const currentStatus = getStore().getState().logs.status

    if (cancelDelayedSetStatus) {
      cancelDelayedSetStatus()
      cancelDelayedSetStatus = null
    }

    if (
      status !== currentStatus &&
      (status === ActivityStatuses.InProgress || force || weShouldExit)
    ) {
      dispatch({
        type: Actions.SetStatus,
        payload: status,
      })
      pendingStatus = ``
    } else {
      // use pending status if truthy, fallback to current status if we don't have pending status
      const pendingOrCurrentStatus = pendingStatus || currentStatus

      if (status !== pendingOrCurrentStatus) {
        pendingStatus = status
        cancelDelayedSetStatus = delayedCall(() => {
          setStatus(status, true)(dispatch)
        }, 1000)
      }
    }
  }

export const createLog = ({
  level,
  text,
  statusText,
  duration,
  group,
  code,
  type,
  category,
  filePath,
  location,
  docsUrl,
  context,
  activity_current,
  activity_total,
  activity_type,
  activity_uuid,
  stack,
  pluginName,
}: {
  level: string
  text?: string
  statusText?: string
  duration?: number
  group?: string
  code?: string
  type?: string
  category?: keyof typeof ErrorCategory
  filePath?: string
  location?: IStructuredError["location"]
  docsUrl?: string
  context?: string
  activity_current?: number
  activity_total?: number
  activity_type?: string
  activity_uuid?: string
  stack?: IStructuredError["stack"]
  pluginName?: string
}): ICreateLog => {
  return {
    type: Actions.Log,
    payload: {
      level,
      text: !text ? `\u2800` : text,
      statusText,
      duration,
      group,
      code,
      type,
      category,
      filePath,
      location,
      docsUrl,
      context,
      activity_current,
      activity_total,
      activity_type,
      activity_uuid,
      timestamp: new Date().toJSON(),
      stack,
      pluginName,
    },
  }
}

type ActionsToEmit = Array<IPendingActivity | ReturnType<typeof setStatus>>
export const createPendingActivity = ({
  id,
  status = ActivityStatuses.NotStarted,
}: {
  id: string
  status?: ActivityStatuses
}): ActionsToEmit => {
  const globalStatus = getGlobalStatus(id, status)
  return [
    setStatus(globalStatus),
    {
      type: Actions.PendingActivity,
      payload: {
        id,
        type: ActivityTypes.Pending,
        startTime: process.hrtime(),
        status,
      },
    },
  ]
}

type QueuedStartActivityActions = Array<
  IStartActivity | ReturnType<typeof setStatus>
>
export const startActivity = ({
  id,
  text,
  type,
  status = ActivityStatuses.InProgress,
  current,
  total,
}: {
  id: string
  text: string
  type: ActivityTypes
  status?: ActivityStatuses
  current?: number
  total?: number
}): QueuedStartActivityActions => {
  const globalStatus = getGlobalStatus(id, status)

  return [
    setStatus(globalStatus),
    {
      type: Actions.StartActivity,
      payload: {
        id,
        uuid: uuid.v4(),
        text,
        type,
        status,
        startTime: process.hrtime(),
        statusText: ``,
        current,
        total,
      },
    },
  ]
}

type QueuedEndActivity = Array<
  ICancelActivity | IEndActivity | ICreateLog | ReturnType<typeof setStatus>
>

export const endActivity = ({
  id,
  status,
}: {
  id: string
  status: ActivityStatuses
}): QueuedEndActivity | null => {
  const activity = getActivity(id)
  if (!activity) {
    return null
  }

  const actionsToEmit: QueuedEndActivity = []
  const durationMS = getElapsedTimeMS(activity)
  const durationS = durationMS / 1000

  if (activity.type === ActivityTypes.Pending) {
    actionsToEmit.push({
      type: Actions.CancelActivity,
      payload: {
        id,
        status: ActivityStatuses.Cancelled,
        type: activity.type,
        duration: durationS,
      },
    })
  } else if (activity.status === ActivityStatuses.InProgress) {
    if (activity.errored) {
      status = ActivityStatuses.Failed
    }
    actionsToEmit.push({
      type: Actions.EndActivity,
      payload: {
        uuid: activity.uuid,
        id,
        status,
        duration: durationS,
        type: activity.type,
      },
    })

    if (activity.type !== ActivityTypes.Hidden) {
      actionsToEmit.push(
        createLog({
          text: activity.text,
          level: ActivityStatusToLogLevel[status],
          duration: durationS,
          statusText:
            activity.statusText ||
            (status === ActivityStatuses.Success &&
            activity.type === ActivityTypes.Progress
              ? `${activity.current}/${activity.total} ${(
                  (activity.total || 0) / durationS
                ).toFixed(2)}/s`
              : undefined),
          activity_uuid: activity.uuid,
          activity_current: activity.current,
          activity_total: activity.total,
          activity_type: activity.type,
        })
      )
    }
  }

  const globalStatus = getGlobalStatus(id, status)
  actionsToEmit.push(setStatus(globalStatus))

  return actionsToEmit
}

export const updateActivity = ({
  id = ``,
  ...rest
}: {
  id: string
  statusText?: string
  total?: number
  current?: number
}): IUpdateActivity | null => {
  const activity = getActivity(id)
  if (!activity) {
    return null
  }

  return {
    type: Actions.UpdateActivity,
    payload: {
      uuid: activity.uuid,
      id,
      ...rest,
    },
  }
}

export const setActivityErrored = ({
  id,
}: {
  id: string
}): IActivityErrored | null => {
  const activity = getActivity(id)
  if (!activity) {
    return null
  }

  return {
    type: Actions.ActivityErrored,
    payload: {
      id,
    },
  }
}

export const setActivityStatusText = ({
  id,
  statusText,
}: {
  id: string
  statusText: string
}): IUpdateActivity | null =>
  updateActivity({
    id,
    statusText,
  })

export const setActivityTotal = ({
  id,
  total,
}: {
  id: string
  total: number
}): IUpdateActivity | null =>
  updateActivity({
    id,
    total,
  })

export const activityTick = ({
  id,
  increment = 1,
}: {
  id: string
  increment: number
}): IUpdateActivity | null => {
  const activity = getActivity(id)
  if (!activity) {
    return null
  }

  return updateActivity({
    id,
    current: (activity.current || 0) + increment,
  })
}

export const setLogs = (logs: IGatsbyCLIState): ISetLogs => {
  return {
    type: Actions.SetLogs,
    payload: logs,
  }
}

export const renderPageTree = (payload: IRenderPageArgs): IRenderPageTree => {
  return {
    type: Actions.RenderPageTree,
    payload,
  }
}
