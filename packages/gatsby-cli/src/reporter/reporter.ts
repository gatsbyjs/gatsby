import { stripIndent } from "common-tags"
import chalk from "chalk"
import { trackError } from "gatsby-telemetry"
import { globalTracer, Span } from "opentracing"

import reporterActions from "./redux/actions"
import { LogLevels, ActivityStatuses } from "./constants"
import { getErrorFormatter } from "./errors"
import constructError from "../structured-errors/construct-error"
import { prematureEnd } from "./catch-exit-signals"
import { IStructuredError } from "../structured-errors/types"
import { createTimerReporter, ITimerReporter } from "./reporter-timer"
import { createPhantomReporter, IPhantomReporter } from "./reporter-phantom"
import { createProgressReporter, IProgressReporter } from "./reporter-progress"
import { ErrorMeta, CreateLogAction } from "./types"

const errorFormatter = getErrorFormatter()
const tracer = globalTracer()

interface IActivityArgs {
  id?: string
  parentSpan?: Span
}

let isVerbose = false

/**
 * Reporter module.
 * @module reporter
 */
class Reporter {
  /**
   * Strip initial indentation template function.
   */
  stripIndent = stripIndent
  format = chalk

  /**
   * Toggle verbosity.
   */
  setVerbose = (_isVerbose: boolean = true): void => {
    isVerbose = _isVerbose
  }

  /**
   * Turn off colors in error output.
   */
  setNoColor = (isNoColor: boolean = false): void => {
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
   */
  panic = (errorMeta: ErrorMeta, error?: Error | Error[]): void => {
    const reporterError = this.error(errorMeta, error)
    trackError(`GENERAL_PANIC`, { error: reporterError })
    prematureEnd()
    process.exit(1)
  }

  panicOnBuild = (
    errorMeta: ErrorMeta,
    error?: Error | Error[]
  ): IStructuredError | IStructuredError[] => {
    const reporterError = this.error(errorMeta, error)
    trackError(`BUILD_PANIC`, { error: reporterError })
    if (process.env.gatsby_executing_command === `build`) {
      prematureEnd()
      process.exit(1)
    }
    return reporterError
  }

  error = (
    errorMeta: ErrorMeta,
    error?: Error | Error[]
  ): IStructuredError | IStructuredError[] => {
    let details: {
      error?: Error
      context: {}
    } = {
      context: {},
    }

    // Many paths to retain backcompat :scream:
    // 1.
    //   reporter.error(any, Error);
    //   reporter.error(any, [Error]);
    if (error) {
      if (Array.isArray(error)) {
        return error.map(errorItem =>
          this.error(errorMeta, errorItem)
        ) as IStructuredError[]
      }
      details.error = error
      details.context = {
        sourceMessage: errorMeta + ` ` + error.message,
      }
      // 2.
      //    reporter.error(Error);
    } else if (errorMeta instanceof Error) {
      details.error = errorMeta
      details.context = {
        sourceMessage: errorMeta.message,
      }
      // 3.
      //    reporter.error([Error]);
    } else if (Array.isArray(errorMeta)) {
      // when we get an array of messages, call this function once for each error
      return errorMeta.map(errorItem =>
        this.error(errorItem)
      ) as IStructuredError[]
      // 4.
      //    reporter.error(errorMeta);
    } else if (typeof errorMeta === `object`) {
      details = { ...errorMeta }
      // 5.
      //    reporter.error('foo');
    } else if (typeof errorMeta === `string`) {
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
   */
  uptime = (prefix: string): void => {
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

  success = (text?: string): CreateLogAction =>
    reporterActions.createLog({ level: LogLevels.Success, text })
  info = (text?: string): CreateLogAction =>
    reporterActions.createLog({ level: LogLevels.Info, text })
  warn = (text?: string): CreateLogAction =>
    reporterActions.createLog({ level: LogLevels.Warning, text })
  log = (text?: string): CreateLogAction =>
    reporterActions.createLog({ level: LogLevels.Log, text })

  pendingActivity = reporterActions.createPendingActivity

  completeActivity = (
    id: string,
    status: ActivityStatuses = ActivityStatuses.Success
  ): void => {
    reporterActions.endActivity({ id, status })
  }

  /**
   * Time an activity.
   */
  activityTimer = (
    text: string,
    activityArgs: IActivityArgs = {}
  ): ITimerReporter => {
    let { parentSpan, id } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan } : {}
    if (!id) {
      id = text
    }

    const span = tracer.startSpan(text, spanArgs)

    return createTimerReporter({ text, id, span, reporter: this })
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
   */
  phantomActivity = (
    text: string,
    activityArgs: IActivityArgs = {}
  ): IPhantomReporter => {
    let { parentSpan, id } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan } : {}
    if (!id) {
      id = text
    }

    const span = tracer.startSpan(text, spanArgs)

    return createPhantomReporter({ id, text, span })
  }

  /**
   * Create a progress bar for an activity
   */
  createProgress = (
    text: string,
    total = 0,
    start = 0,
    activityArgs: IActivityArgs = {}
  ): IProgressReporter => {
    let { parentSpan, id } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan } : {}
    if (!id) {
      id = text
    }
    const span = tracer.startSpan(text, spanArgs)

    return createProgressReporter({
      id,
      text,
      total,
      start,
      span,
      reporter: this,
    })
  }

  // This method was called in older versions of gatsby, so we need to keep it to avoid
  // "reporter._setStage is not a function" error when gatsby@<2.16 is used with gatsby-cli@>=2.8
  _setStage = (): void => {}
}

export const reporter = new Reporter()
