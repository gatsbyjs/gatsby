/*
 * This module is used to catch if the user kills the gatsby process via cmd+c
 * When this happens, there is some clean up logic we need to fire offf
 */
import signalExit from "signal-exit";
import { getStore } from "./redux";
import { createPendingActivity } from "./redux/actions";
import { reporter } from "./reporter";

function interruptActivities(): void {
  const { activities } = getStore().getState().logs;
  Object.keys(activities).forEach((activityId) => {
    const activity = activities[activityId];
    if (
      activity.status === "IN_PROGRESS" ||
      activity.status === "NOT_STARTED"
    ) {
      reporter.completeActivity(activityId, "INTERRUPTED");
    }
  });
}

export function prematureEnd(): void {
  // hack so at least one activity is surely failed, so
  // we are guaranteed to generate FAILED status
  // if none of activity did explicitly fail
  createPendingActivity({
    id: "panic",
    status: "FAILED",
  });

  interruptActivities();
}

export function catchExitSignals(): void {
  signalExit.onExit((code, signal) => {
    if (code !== 0 && signal !== "SIGINT" && signal !== "SIGTERM") {
      prematureEnd();
    } else {
      interruptActivities();
    }
  });
}
