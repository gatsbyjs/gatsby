import { ActionsUnion, IActivity } from "./types"
import { ActivityStatuses } from "../constants"
import { calcElapsedTime } from "../../util/calc-elapsed-time"
import { isActivityInProgress } from "./utils"
import type { Reporter } from "../reporter"
import type { GatsbyCLIStore } from "./"

function calculateTimeoutDelay(
  envVarValue: string | undefined,
  defaultValue: number,
  min: number
): number {
  if (!envVarValue) {
    return 0
  } else if (envVarValue === `1`) {
    // Toggling env vars with "1" is quite common - because we allow to set
    // specific timeout values with env var, this special case is added
    // (1ms timeout makes little sense - that's too low value to be used as-is)
    return defaultValue
  }

  const parsedToNumber = parseInt(envVarValue, 10)
  if (isNaN(parsedToNumber)) {
    // It's truthy, but not a number - let's enable it with default value
    return defaultValue
  }

  // Allow to custom specific timeout value, but also put some minimal
  // timeout bound as there is little usefulness of setting it to
  // something less than few seconds.
  return Math.max(parsedToNumber, min)
}

type DiagnosticsMiddleware = (action: ActionsUnion) => void

const FIVE_MINUTES = 1000 * 60 * 5
const FIVE_SECONDS = 1000 * 5
const TEN_MINUTES = 1000 * 60 * 10
const TEN_SECONDS = 1000 * 10

export function createStructuredLoggingDiagnosticsMiddleware(
  store: GatsbyCLIStore
): DiagnosticsMiddleware {
  const stuckStatusDiagnosticTimeoutDelay = calculateTimeoutDelay(
    process.env.GATSBY_DIAGNOSTIC_STUCK_STATUS_TIMEOUT,
    FIVE_MINUTES, // default timeout
    FIVE_SECONDS // minimal timeout (this is mostly useful for debugging diagnostic code itself)
  )

  const stuckStatusWatchdogTimeoutDelay = calculateTimeoutDelay(
    process.env.GATSBY_WATCHDOG_STUCK_STATUS_TIMEOUT,
    TEN_MINUTES, // default timeout
    TEN_SECONDS // minimal timeout (this is mostly useful for debugging diagnostic code itself)
  )

  if (!stuckStatusDiagnosticTimeoutDelay && !stuckStatusWatchdogTimeoutDelay) {
    // none of timers are enabled, so this is no-op middleware
    return (): void => {}
  }

  let displayedStuckStatusDiagnosticWarning = false
  let displayingStuckStatusDiagnosticWarning = false
  let stuckStatusDiagnosticTimer: NodeJS.Timeout | null = null
  let stuckStatusWatchdogTimer: NodeJS.Timeout | null = null
  let reporter: Reporter

  function inProgressActivities(): Array<
    IActivity & { diagnostics_elapsed_seconds?: string }
  > {
    const { activities } = store.getState().logs
    return Object.values(activities)
      .filter(activity => isActivityInProgress(activity.status))
      .map(activity => {
        if (!activity.startTime) {
          return activity
        }

        return {
          ...activity,
          diagnostics_elapsed_seconds: calcElapsedTime(activity.startTime),
        }
      })
  }

  function generateStuckStatusDiagnosticMessage(): string {
    const activities = inProgressActivities()
    return Object.values(activities)
      .map(
        activity =>
          `- Activity "${activity.text}" of type "${activity.type}" is currently in state "${activity.status}"`
      )
      .join(`\n`)
  }

  return function diagnosticMiddleware(action: ActionsUnion): void {
    // ignore diagnostic logs, otherwise diagnostic message itself will reset
    // the timers
    if (!displayingStuckStatusDiagnosticWarning) {
      const currentStatus = store.getState().logs.status

      if (!reporter) {
        // yuck, we have situation of circular dependencies here
        // so this `reporter` import is delayed until it's actually needed
        reporter = require(`../reporter`).reporter
      }

      if (stuckStatusDiagnosticTimeoutDelay) {
        if (stuckStatusDiagnosticTimer) {
          clearTimeout(stuckStatusDiagnosticTimer)
          stuckStatusDiagnosticTimer = null
        }

        if (displayedStuckStatusDiagnosticWarning) {
          // using nextTick here to prevent infinite recursion (report.warn would
          // result in another call of this function and so on)
          process.nextTick(() => {
            const activitiesDiagnosticsMessage =
              generateStuckStatusDiagnosticMessage()
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
                  stuckStatusDiagnosticTimeoutDelay / 1000
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
          stuckStatusWatchdogTimer = null
        }

        if (currentStatus === ActivityStatuses.InProgress) {
          stuckStatusWatchdogTimer = setTimeout(
            function fatalStuckStatusHandler() {
              reporter.panic({
                id: `11701`,
                context: {
                  activities: inProgressActivities(),
                  status: store.getState().logs.status,
                  stuckStatusDiagnosticMessage:
                    generateStuckStatusDiagnosticMessage(),
                  stuckStatusWatchdogTimeoutDelay,
                },
              })
            },
            stuckStatusWatchdogTimeoutDelay
          )
        }
      }
    }
  }
}
