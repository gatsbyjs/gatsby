import semver from "semver"
import { isCI } from "gatsby-core-utils"
import onExit from "signal-exit"
import reporterActions from "./redux/actions"

import {
  LogLevels,
  ActivityStatuses,
  ActivityTypes,
  Actions,
} from "./constants"
import { Span, globalTracer } from "opentracing"
import util from "util"
import { trackError } from "gatsby-telemetry"
import { getErrorFormatter } from "./errors"
import { getStore } from "./redux"
import constructError, {
  IStructuredError,
} from "../structured-errors/construct-error"

export { stripIndent } from "common-tags"
import chalk from "chalk"
import { ErrorId } from "../structured-errors/error-map"
export const format = chalk

const tracer = globalTracer()

let inkExists = false
try {
  inkExists = !!require.resolve(`ink`)
  // eslint-disable-next-line no-empty
} catch (err) {}

if (!process.env.GATSBY_LOGGER) {
  if (
    inkExists &&
    semver.satisfies(process.version, `>=8`) &&
    !isCI() &&
    typeof jest === `undefined`
  ) {
    process.env.GATSBY_LOGGER = `ink`
  } else {
    process.env.GATSBY_LOGGER = `yurnalist`
  }
}
// if child process - use ipc logger
if (process.send) {
  // process.env.FORCE_COLOR = `0`

  require(`./loggers/ipc`)
}

if (process.env.GATSBY_LOGGER.includes(`json`)) {
  require(`./loggers/json`)
} else if (process.env.GATSBY_LOGGER.includes(`yurnalist`)) {
  require(`./loggers/yurnalist`)
} else {
  require(`./loggers/ink`)
}

const errorFormatter = getErrorFormatter()

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ActivityTracker {
  start(): void
  end(): void
  span: Span
  setStatus(status: string): void
  panic: (errorMeta: ErrorMeta, error?: Error) => never
  panicOnBuild: (errorMeta: ErrorMeta, error?: Error) => Error | undefined
}

export type ProgressActivityTracker = Omit<ActivityTracker, "end"> & {
  tick(increment?: number): void
  done(): void
  total: number
}

export interface IActivityArgs {
  parentSpan?: Span
  id?: string
}

export interface IErrorDetails {
  id?: ErrorId
  context?: Record<string, unknown>
  error?: Error
  [key: string]: unknown
}

export type ErrorMeta = string | IErrorDetails | IErrorDetails[] | Error

interface ILogAction {
  type: Actions.Log
  payload: Record<string, unknown>
}

const addMessage = level => (text: string): ILogAction =>
  reporterActions.createLog({ level, text })

let isVerbose = false

/**
 * Reporter module.
 * @module reporter
 */
class Reporter {
  interuptActivities = (): void => {
    const { activities } = getStore().getState().logs
    Object.keys(activities).forEach(activityId => {
      const activity = activities[activityId]
      if (
        activity.status === ActivityStatuses.InProgress ||
        activity.status === ActivityStatuses.NotStarted
      ) {
        this.completeActivity(activityId, ActivityStatuses.Interrupted)
      }
    })
  }

  prematureEnd = (): void => {
    // hack so at least one activity is surely failed, so
    // we are guaranteed to generate FAILED status
    // if none of activity did explicitly fail
    reporterActions.createPendingActivity({
      id: `panic`,
      status: ActivityStatuses.Failed,
    })

    this.interuptActivities()
  }

  constructor() {
    onExit((code, signal) => {
      if (code !== 0 && signal !== `SIGINT` && signal !== `SIGTERM`)
        this.prematureEnd()
      else this.interuptActivities()
    })
  }

  /**
   * Strip initial indentation template function.
   */
  stripIndent
  format = chalk
  /**
   * Toggle verbosity.
   * @param {boolean} [_isVerbose=true]
   */
  setVerbose = (_isVerbose = true): void => {
    isVerbose = _isVerbose
  }
  /**
   * Turn off colors in error output.
   * @param {boolean} [isNoColor=false]
   */
  setNoColor(isNoColor = false): void {
    if (isNoColor) {
      errorFormatter.withoutColors()
    }

    // disables colors in popular terminal output coloring packages
    //  - chalk: see https://www.npmjs.com/package/chalk#chalksupportscolor
    //  - ansi-colors: see https://github.com/doowb/ansi-colors/blob/8024126c7115a0efb25a9a0e87bc5e29fd66831f/index.js#L5-L7
    if (isNoColor) {
      process.env.FORCE_COLOR = `0`
      // chalk determines color level at import time. Before we reach this point,
      // chalk was already imported, so we need to retroactively adjust level
      chalk.level = 0
    }
  }
  /**
   * Log arguments and exit process with status 1.
   * @param {*} args
   */
  panic(errorMeta: ErrorMeta, error?: Error): never {
    const details = this.error(errorMeta, error)
    trackError(`GENERAL_PANIC`, { error: details })
    this.prematureEnd()
    process.exit(1)
  }

  panicOnBuild(errorMeta: ErrorMeta, error?: Error): Error | undefined {
    const details = this.error(errorMeta, error)
    trackError(`BUILD_PANIC`, { error: details })
    if (process.env.gatsby_executing_command === `build`) {
      this.prematureEnd()
      process.exit(1)
    }
    return error
  }

  error(
    errorMeta: ErrorMeta,
    error?: Error | Error[]
  ): IStructuredError | IStructuredError[] {
    let details: IErrorDetails = {}
    // Many paths to retain backcompat :scream:
    if (error) {
      if (Array.isArray(error)) {
        return error.map(
          errorItem => this.error(errorMeta, errorItem) as IStructuredError
        )
      }
      details.error = error
      details.context = {
        sourceMessage: errorMeta + ` ` + error?.message,
      }
    } else if (errorMeta instanceof Error) {
      details.error = errorMeta
      details.context = {
        sourceMessage: errorMeta.message,
      }
    } else if (Array.isArray(errorMeta)) {
      // when we get an array of messages, call this function once for each error
      return errorMeta.map(
        errorItem => this.error(errorItem) as IStructuredError
      )
    } else if (arguments.length === 1 && typeof errorMeta === `object`) {
      details = { ...errorMeta }
    } else if (arguments.length === 1 && typeof errorMeta === `string`) {
      details.context = {
        sourceMessage: errorMeta,
      }
    }

    const structuredError = constructError({ details })
    if (structuredError) {
      reporterActions.createLog(structuredError)
    }

    // TODO: remove this once Error component can render this info
    // log formatted stacktrace
    if (structuredError.error) {
      this.log(errorFormatter.render(structuredError.error))
    }
    return structuredError
  }

  /**
   * Set prefix on uptime.
   * @param {string} prefix - A string to prefix uptime with.
   */
  uptime(prefix): void {
    this.verbose(`${prefix}: ${(process.uptime() * 1000).toFixed(3)}ms`)
  }

  verbose = (text: string): void => {
    if (isVerbose) {
      reporterActions.createLog({
        level: LogLevels.Debug,
        text,
      })
    }
  }

  success = addMessage(LogLevels.Success)
  info = addMessage(LogLevels.Info)
  warn = addMessage(LogLevels.Warning)
  log = addMessage(LogLevels.Log)

  pendingActivity: reporterActions.createPendingActivity

  completeActivity = (
    id: string,
    status: string = ActivityStatuses.Success
  ): void => {
    reporterActions.endActivity({ id, status })
  }

  /**
   * Time an activity.
   * @param {string} text - Name of activity.
   * @param {IActivityArgs} activityArgs - optional object with tracer parentSpan
   * @returns {ActivityTracker} The activity tracker.
   */
  activityTimer(
    text: string,
    activityArgs: IActivityArgs = {}
  ): ActivityTracker {
    let { parentSpan, id } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan } : {}
    if (!id) {
      id = text
    }

    const span = tracer.startSpan(text, spanArgs)

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const reporter = this

    return {
      start: (): void => {
        reporterActions.startActivity({
          id,
          text,
          type: ActivityTypes.Spinner,
        })
      },
      setStatus: (statusText: string): void => {
        reporterActions.setActivityStatusText({
          id,
          statusText,
        })
      },
      panicOnBuild(...args): Error | undefined {
        span.finish()

        reporterActions.setActivityErrored({
          id,
        })

        return reporter.panicOnBuild(...args)
      },
      panic(...args): never {
        span.finish()

        reporterActions.endActivity({
          id,
          status: ActivityStatuses.Failed,
        })

        return reporter.panic(...args)
      },
      end(): void {
        span.finish()

        reporterActions.endActivity({
          id,
          status: ActivityStatuses.Success,
        })
      },
      span,
    }
  }

  /**
   * Create an Activity that is not visible to the user
   *
   * During the lifecycle of the Gatsby process, sometimes we need to do some
   * async work and wait for it to complete. A typical example of this is a job.
   * This work should set the status of the process to `in progress` while running and
   * `complete` (or `failure`) when complete. Activities do just this! However, they
   * are visible to the user. So this function can be used to create a _hidden_ activity
   * that while not displayed in the CLI, still triggers a change in process status.
   *
   * @param {string} text - Name of activity.
   * @param {IActivityArgs} activityArgs - optional object with tracer parentSpan
   * @returns {ActivityTracker} The activity tracker.
   */
  phantomActivity(
    text: string,
    activityArgs: IActivityArgs = {}
  ): ActivityTracker {
    let { parentSpan, id } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan } : {}
    if (!id) {
      id = text
    }

    const span = tracer.startSpan(text, spanArgs)

    return {
      setStatus: (): void => {},
      panic: (): never => undefined as never,
      panicOnBuild: (): undefined => undefined,
      start: (): void => {
        reporterActions.startActivity({
          id,
          text,
          type: ActivityTypes.Hidden,
        })
      },
      end(): void {
        span.finish()

        reporterActions.endActivity({
          id,
          status: ActivityStatuses.Success,
        })
      },
      span,
    }
  }

  /**
   * Create a progress bar for an activity
   * @param text - Name of activity.
   * @param total - Total items to be processed.
   * @param  start - Start count to show.
   * @param activityArgs - optional object with tracer parentSpan
   * @returns  The activity tracker.
   */
  createProgress(
    text: string,
    total = 0,
    start = 0,
    activityArgs: IActivityArgs = {}
  ): ProgressActivityTracker {
    let { parentSpan, id } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan } : {}
    if (!id) {
      id = text
    }
    const span = tracer.startSpan(text, spanArgs)

    let lastUpdateTime = 0
    let unflushedProgress = 0
    let unflushedTotal = 0
    const progressUpdateDelay = Math.round(1000 / 10) // 10 fps *shrug*

    const updateProgress = (forced?: boolean): void => {
      const t = Date.now()
      if (!forced && t - lastUpdateTime <= progressUpdateDelay) return

      if (unflushedTotal > 0) {
        reporterActions.setActivityTotal({ id, total: unflushedTotal })
        unflushedTotal = 0
      }
      if (unflushedProgress > 0) {
        reporterActions.activityTick({ id, increment: unflushedProgress })
        unflushedProgress = 0
      }
      lastUpdateTime = t
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const reporter = this

    return {
      start: (): void => {
        reporterActions.startActivity({
          id,
          text,
          type: ActivityTypes.Progress,
          current: start,
          total,
        })
      },
      setStatus: (statusText: string): void => {
        reporterActions.setActivityStatusText({
          id,
          statusText,
        })
      },
      tick: (increment = 1): void => {
        unflushedProgress += increment // Have to manually track this :/
        updateProgress()
      },
      panicOnBuild(...args): Error | undefined {
        span.finish()

        reporterActions.setActivityErrored({
          id,
        })

        return reporter.panicOnBuild(...args)
      },
      panic(...args): never {
        span.finish()

        reporterActions.endActivity({
          id,
          status: ActivityStatuses.Failed,
        })

        return reporter.panic(...args)
      },
      done: (): void => {
        updateProgress(true)
        span.finish()
        reporterActions.endActivity({
          id,
          status: ActivityStatuses.Success,
        })
      },
      set total(value) {
        unflushedTotal = value
        updateProgress()
      },
      span,
    }
  }
  // This method was called in older versions of gatsby, so we need to keep it to avoid
  // "reporter._setStage is not a function" error when gatsby@<2.16 is used with gatsby-cli@>=2.8
  _setStage(): void {}
}

const reporter = new Reporter()

console.log = (format: string, ...args: unknown[]): ILogAction =>
  reporter.log(util.format(format, ...args))
console.warn = (format: string, ...args: unknown[]): ILogAction =>
  reporter.warn(util.format(format, ...args))
console.info = (format: string, ...args: unknown[]): ILogAction =>
  reporter.info(util.format(format, ...args))
console.error = (
  format: string,
  ...args: unknown[]
): IStructuredError | IStructuredError[] =>
  reporter.error(util.format(format, ...args))

module.exports = reporter
