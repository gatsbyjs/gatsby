import { getStore } from "./index"
import convertHrtime from "convert-hrtime"
import { Actions, ActivityTypes, ActivityStatuses } from "../constants"
import { ActionsUnion, IActivity } from "./types"
import signalExit from "signal-exit"

export function isActivityInProgress(
  activityStatus: ActivityStatuses
): boolean {
  return (
    activityStatus === ActivityStatuses.InProgress ||
    activityStatus === ActivityStatuses.NotStarted
  )
}

export const getGlobalStatus = (
  id: string,
  status: ActivityStatuses
): ActivityStatuses => {
  const { logs } = getStore().getState()

  const currentActivities = [id, ...Object.keys(logs.activities)]

  return currentActivities.reduce(
    (
      generatedStatus: ActivityStatuses,
      activityId: string
    ): ActivityStatuses => {
      const activityStatus =
        activityId === id ? status : logs.activities[activityId].status

      if (isActivityInProgress(activityStatus)) {
        return ActivityStatuses.InProgress
      } else if (
        activityStatus === ActivityStatuses.Failed &&
        generatedStatus !== ActivityStatuses.InProgress
      ) {
        return ActivityStatuses.Failed
      } else if (
        activityStatus === ActivityStatuses.Interrupted &&
        generatedStatus !== ActivityStatuses.InProgress
      ) {
        return ActivityStatuses.Interrupted
      }
      return generatedStatus
    },
    ActivityStatuses.Success
  ) as ActivityStatuses
}

export const getActivity = (id: string): IActivity | null =>
  getStore().getState().logs.activities[id]

/**
 * @returns {Number} Milliseconds from activity start
 */
export const getElapsedTimeMS = (activity: IActivity): number => {
  const elapsed = process.hrtime(activity.startTime)
  return convertHrtime(elapsed).milliseconds
}

export const isInternalAction = (action: ActionsUnion): boolean => {
  switch (action.type) {
    case Actions.PendingActivity:
    case Actions.CancelActivity:
    case Actions.ActivityErrored:
      return true
    case Actions.StartActivity:
    case Actions.EndActivity:
      return action.payload.type === ActivityTypes.Hidden
    default:
      return false
  }
}

/**
 * Like setTimeout, but also handle signalExit
 */
export const delayedCall = (fn: () => void, timeout: number): (() => void) => {
  const fnWrap = (): void => {
    fn()
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    clear()
  }

  const timeoutID = setTimeout(fnWrap, timeout)
  const cancelSignalExit = signalExit(fnWrap)

  const clear = (): void => {
    clearTimeout(timeoutID)
    cancelSignalExit()
  }

  return clear
}
