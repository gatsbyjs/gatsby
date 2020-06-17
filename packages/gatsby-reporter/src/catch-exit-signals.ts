/*
 * This module is used to catch if the user kills the gatsby process via cmd+c
 * When this happens, there is some clean up logic we need to fire offf
 */
import signalExit from "signal-exit"
import { getStore } from "./redux"
import { createPendingActivity } from "./redux/actions"
import { ActivityStatuses } from "./constants"
import { reporter } from "./reporter"

const interruptActivities = (): void => {
  const { activities } = getStore().getState().logs
  Object.keys(activities).forEach(activityId => {
    const activity = activities[activityId]
    if (
      activity.status === ActivityStatuses.InProgress ||
      activity.status === ActivityStatuses.NotStarted
    ) {
      reporter.completeActivity(activityId, ActivityStatuses.Interrupted)
    }
  })
}

export const prematureEnd = (): void => {
  // hack so at least one activity is surely failed, so
  // we are guaranteed to generate FAILED status
  // if none of activity did explicitly fail
  createPendingActivity({
    id: `panic`,
    status: ActivityStatuses.Failed,
  })

  interruptActivities()
}

export const catchExitSignals = (): void => {
  signalExit((code, signal) => {
    if (code !== 0 && signal !== `SIGINT` && signal !== `SIGTERM`)
      prematureEnd()
    else interruptActivities()
  })
}
