import { getStore } from "./index";
import convertHrtime from "convert-hrtime";
import { Actions, ActivityTypes, type ActivityStatuses } from "../constants";
import type { ActionsUnion, IActivity } from "./types";
import signalExit from "signal-exit";

export function isActivityInProgress(
  activityStatus: ActivityStatuses,
): boolean {
  return activityStatus === "IN_PROGRESS" || activityStatus === "NOT_STARTED";
}

export function getGlobalStatus(
  id: string,
  status: ActivityStatuses,
): ActivityStatuses {
  const { logs } = getStore().getState();

  const currentActivities = [id, ...Object.keys(logs.activities)];

  return currentActivities.reduce(
    (
      generatedStatus: ActivityStatuses,
      activityId: string,
    ): ActivityStatuses => {
      const activityStatus =
        activityId === id ? status : logs.activities[activityId].status;

      if (isActivityInProgress(activityStatus)) {
        return "IN_PROGRESS";
      } else if (
        activityStatus === "FAILED" &&
        generatedStatus !== "IN_PROGRESS"
      ) {
        return "FAILED";
      } else if (
        activityStatus === "INTERRUPTED" &&
        generatedStatus !== "IN_PROGRESS"
      ) {
        return "INTERRUPTED";
      }
      return generatedStatus;
    },
    "SUCCESS" as ActivityStatuses,
  ) as ActivityStatuses;
}

export function getActivity(id: string): IActivity | null {
  return getStore().getState().logs.activities[id];
}

/**
 * @returns {Number} Milliseconds from activity start
 */
export function getElapsedTimeMS(activity: IActivity): number {
  const elapsed = process.hrtime(activity.startTime);
  // @ts-ignore
  return convertHrtime(elapsed).milliseconds;
}

export function isInternalAction(action: ActionsUnion): boolean {
  switch (action.type) {
    case Actions.PendingActivity:
    case Actions.CancelActivity:
    case Actions.ActivityErrored: {
      return true;
    }
    case Actions.StartActivity:
    case Actions.EndActivity: {
      return action.payload.type === ActivityTypes.Hidden;
    }
    default: {
      return false;
    }
  }
}

/**
 * Like setTimeout, but also handle signalExit
 */
export function delayedCall(fn: () => void, timeout: number): () => void {
  function fnWrap(): void {
    fn();
    clear();
  }

  const timeoutID = globalThis.setTimeout(fnWrap, timeout);
  const cancelSignalExit = signalExit.onExit(fnWrap);

  function clear(): void {
    globalThis.clearTimeout(timeoutID);
    cancelSignalExit();
  }

  return clear;
}
