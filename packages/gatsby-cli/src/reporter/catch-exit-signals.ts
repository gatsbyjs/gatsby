/*
 * This module is used to catch if the user kills the gatsby process via cmd+c
 * When this happens, there is some clean up logic we need to fire offf
 */
import signalExit from "signal-exit"
import { getStore } from "./redux"
import { createPendingActivity } from "./redux/actions"
import { ActivityStatuses, ActivityTypes } from "./constants"
import { reporter } from "./reporter"

const interruptActivities = ({
  showCancelledPendingActivities = false,
}: {
  showCancelledPendingActivities?: boolean
} = {}): void => {
  const { activities } = getStore().getState().logs
  const cancelledPendingActivitiesIds: Array<string> = []
  Object.keys(activities).forEach(activityId => {
    const activity = activities[activityId]
    if (
      activity.status === ActivityStatuses.InProgress ||
      activity.status === ActivityStatuses.NotStarted
    ) {
      reporter.completeActivity(activityId, ActivityStatuses.Interrupted)
      if (activity.type === ActivityTypes.Pending) {
        // pending activities are hidden from UI, so we construct
        // list of pending activities to log them to make it easier
        // to debug any timing issues related to reporting
        // global status (SET_STATUS)
        cancelledPendingActivitiesIds.push(`"${activityId}"`)
      }
    }
  })

  if (
    showCancelledPendingActivities &&
    cancelledPendingActivitiesIds.length > 0
  ) {
    reporter.warn(
      `There were pending activities:\n${cancelledPendingActivitiesIds.join(
        `, `
      )}.\nPlease, create bug report, if you see this warning when exiting idle process.`
    )
  }
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
    if (code !== 0 && signal !== `SIGINT` && signal !== `SIGTERM`) {
      prematureEnd()
    } else {
      const isSignalled = signal === `SIGINT` || signal === `SIGTERM`
      interruptActivities({
        showCancelledPendingActivities: isSignalled,
      })
    }
  })
}
