import { createStore, combineReducers } from "redux"
import { reducer } from "./reducer"
import { ActionsUnion, ISetLogs } from "./types"
import { isInternalAction } from "./utils"
import { calcElapsedTime } from "../../util/calc-elapsed-time"
import { Actions, ActivityStatuses } from "../constants"
import { setTimeout } from "timers"

let store = createStore(
  combineReducers({
    logs: reducer,
  }),
  {}
)

function calculateTimeoutDelay(
  envVarValue: string | undefined,
  defaultValue: number,
  min: number
): number | null {
  if (!envVarValue) {
    return null
  } else if (envVarValue === `1`) {
    // toggling env vars with "1" is quite common - because we allow to set
    // specific timeout values with env var, this special case is added
    // (1ms timeout makes little sense - that's too low value to be used as-is)
    return defaultValue
  }

  const parsedToNumber = parseInt(envVarValue)
  if (isNaN(parsedToNumber)) {
    // it's truthy, but not a number - let's enable it with default value
    return defaultValue
  }

  // allow to custom specific timeout value, but also keep in mind that
  // setting env var to "1" is common way of toggling features
  // and we don't want to set to 1ms in those cases
  return Math.max(parsedToNumber, min)
}

const stuckStatusDiagnosticTimeoutDelay = calculateTimeoutDelay(
  process.env.GATSBY_DIAGNOSTIC_STUCK_STATUS_TIMEOUT,
  1000 * 60 * 5, // 5 minutes default timeout
  1000 * 5 // 5 seconds minimal value (this is mostly useful for debugging diagnostic code itself)
)

// console.log(`stuck stuff`, stuckStatusDiagnosticTimeoutDelay)

const stuckStatusWatchdogTimeoutDelay = calculateTimeoutDelay(
  process.env.GATSBY_WATCHDOG_STUCK_STATUS_TIMEOUT,
  1000 * 60 * 10, // 10 minutes default timeout
  1000 * 10 // 10 seconds minimal value (this is mostly useful for debugging diagnostic code itself)
)

let displayedStuckStatusDiagnosticWarning = false
let displayingStuckStatusDiagnosticWarning = false
let stuckStatusDiagnosticTimer: NodeJS.Timeout
let stuckStatusWatchdogTimer: NodeJS.Timeout
function generateStuckStatusDiagnosticMessage(): string {
  const { activities } = store.getState().logs

  return JSON.stringify(
    Object.values(activities)
      .filter(
        activity =>
          activity.status === ActivityStatuses.InProgress ||
          activity.status === ActivityStatuses.NotStarted
      )
      .map(activity => {
        if (!activity.startTime) {
          return activity
        }

        return {
          ...activity,
          diagnostics_elapsed_seconds: calcElapsedTime(activity.startTime),
        }
      }),
    null,
    2
  )
}

export type GatsbyCLIStore = typeof store
type StoreListener = (store: GatsbyCLIStore) => void
type ActionLogListener = (action: ActionsUnion) => any
type Thunk = (...args: any[]) => ActionsUnion

const storeSwapListeners: StoreListener[] = []
const onLogActionListeners = new Set<ActionLogListener>()

export const getStore = (): typeof store => store

export const dispatch = (action: ActionsUnion | Thunk): void => {
  if (!action) {
    return
  }

  if (Array.isArray(action)) {
    action.forEach(item => dispatch(item))
    return
  } else if (typeof action === `function`) {
    action(dispatch)
    return
  }

  action = {
    ...action,
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore this is a typescript no-no..
    // And i'm pretty sure this timestamp isn't used anywhere.
    // but for now, the structured logs integration tests expect it
    // so it's easier to leave it and then explore as a follow up
    timestamp: new Date().toJSON(),
  } as ActionsUnion

  store.dispatch(action)

  // ignore diagnostic logs, otherwise diagnostic message itself will reset
  // the timers
  if (!displayingStuckStatusDiagnosticWarning) {
    const currentStatus = store.getState().logs.status

    // yuck, we have situation of circular dependencies here
    // so this is `reporter` import is delayed until it's actually needed
    const { reporter } = require(`../reporter`)

    if (stuckStatusDiagnosticTimeoutDelay) {
      if (stuckStatusDiagnosticTimer) {
        clearTimeout(stuckStatusDiagnosticTimer)
      }

      if (displayedStuckStatusDiagnosticWarning) {
        // using nextTick here to prevent infinite recursion (report.warn would
        // result in another call of this function and so on)
        process.nextTick(() => {
          const activitiesDiagnosticsMessage = generateStuckStatusDiagnosticMessage()
          reporter.warn(
            `This is just diagnostic information (enabled by GATSBY_DIAGNOSTIC_STUCK_STATUS_TIMEOUT):\n\nThere was activity since last diagnostic message. Log action:\n\n${JSON.stringify(
              action,
              null,
              2
            )}\n\nCurrently Gatsby is in: "${
              store.getState().logs.status
            }" state.${
              activitiesDiagnosticsMessage.length > 0
                ? `\n\nActivities preventing Gatsby from transitioning to idle state:\n\n${activitiesDiagnosticsMessage}`
                : ``
            }`
          )
        })
        displayedStuckStatusDiagnosticWarning = false
      }

      if (currentStatus === ActivityStatuses.InProgress) {
        stuckStatusDiagnosticTimer = setTimeout(
          function logStuckStatusDiagnostic() {
            displayingStuckStatusDiagnosticWarning = true
            reporter.warn(
              `This is just diagnostic information (enabled by GATSBY_DIAGNOSTIC_STUCK_STATUS_TIMEOUT):\n\nGatsby is in "${
                store.getState().logs.status
              }" state without any updates for ${(
                (stuckStatusDiagnosticTimeoutDelay ?? 0) / 1000
              ).toFixed(
                3
              )} seconds. Activities preventing Gatsby from transitioning to idle state:\n\n${generateStuckStatusDiagnosticMessage()}${
                stuckStatusWatchdogTimeoutDelay
                  ? `\n\nProcess will be terminated in ${(
                      (stuckStatusWatchdogTimeoutDelay -
                        stuckStatusDiagnosticTimeoutDelay) /
                      1000
                    ).toFixed(3)} seconds if nothing will change.`
                  : ``
              }`
            )
            displayingStuckStatusDiagnosticWarning = false
            displayedStuckStatusDiagnosticWarning = true
          },
          stuckStatusDiagnosticTimeoutDelay
        )
      }
    }

    if (stuckStatusWatchdogTimeoutDelay) {
      if (stuckStatusWatchdogTimer) {
        clearTimeout(stuckStatusWatchdogTimer)
      }

      if (currentStatus === ActivityStatuses.InProgress) {
        stuckStatusWatchdogTimer = setTimeout(
          function fatalStuckStatusHandler() {
            reporter.panic(
              `Terminating the process (due to GATSBY_WATCHDOG_STUCK_STATUS_TIMEOUT):\n\nGatsby is in "${
                store.getState().logs.status
              }" state without any updates for ${(
                (stuckStatusWatchdogTimeoutDelay ?? 0) / 1000
              ).toFixed(
                3
              )} seconds. Activities preventing Gatsby from transitioning to idle state:\n\n${generateStuckStatusDiagnosticMessage()}`
            )
          },
          stuckStatusWatchdogTimeoutDelay
        )
      }
    }
  }

  if (isInternalAction(action)) {
    // consumers (ipc, yurnalist, json logger) shouldn't have to
    // deal with actions needed just for internal tracking of status
    return
  }
  for (const fn of onLogActionListeners) {
    fn(action)
  }
}

export const onStoreSwap = (fn: StoreListener): void => {
  storeSwapListeners.push(fn)
}

export const onLogAction = (fn: ActionLogListener): (() => void) => {
  onLogActionListeners.add(fn)

  return (): void => {
    onLogActionListeners.delete(fn)
  }
}

export const setStore = (s: GatsbyCLIStore): void => {
  s.dispatch({
    type: Actions.SetLogs,
    payload: store.getState().logs,
  } as ISetLogs)
  store = s
  storeSwapListeners.forEach(fn => fn(store))
}
