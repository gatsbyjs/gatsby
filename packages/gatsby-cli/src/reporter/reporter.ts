import { stripIndent } from "common-tags"
import chalk from "chalk"
import { globalTracer, Span, SpanContext } from "opentracing"

import * as reduxReporterActions from "./redux/actions"
import { LogLevels, ActivityStatuses } from "./constants"
import { getErrorFormatter } from "./errors"
import constructError from "../structured-errors/construct-error"
import {
  IErrorMapEntryPublicApi,
  ErrorId,
} from "../structured-errors/error-map"
import { prematureEnd } from "./catch-exit-signals"
import { IConstructError, IStructuredError } from "../structured-errors/types"
import { createTimerReporter, ITimerReporter } from "./reporter-timer"
import { createPhantomReporter, IPhantomReporter } from "./reporter-phantom"
import { createProgressReporter, IProgressReporter } from "./reporter-progress"
import {
  ErrorMeta,
  CreateLogAction,
  ILogIntent,
  IRenderPageArgs,
} from "./types"
import {
  registerAdditionalDiagnosticOutputHandler,
  AdditionalDiagnosticsOutputHandler,
} from "./redux/diagnostics"
import { isTruthy } from "gatsby-core-utils/is-truthy"

const errorFormatter = getErrorFormatter()
const tracer = globalTracer()

let reporterActions = reduxReporterActions

export interface IActivityArgs {
  id?: string
  parentSpan?: Span | SpanContext
  tags?: { [key: string]: any }
}

// eslint-disable-next-line prefer-const
let isVerbose = isTruthy(process.env.GATSBY_REPORTER_ISVERBOSE)

function isLogIntentMessage(msg: any): msg is ILogIntent {
  return msg && msg.type === `LOG_INTENT`
}

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

  errorMap: Record<ErrorId, IErrorMapEntryPublicApi> = {}

  /**
   * Set a custom error map to the reporter. This allows
   * the reporter to extend the internal error map
   *
   * Please note: The entered IDs ideally should be different from the ones we internally use:
   * https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-cli/src/structured-errors/error-map.ts
   */

  setErrorMap = (entry: Record<string, IErrorMapEntryPublicApi>): void => {
    this.errorMap = {
      ...this.errorMap,
      ...entry,
    }
  }

  /**
   * Toggle verbosity.
   */
  setVerbose = (_isVerbose: boolean = true): void => {
    isVerbose = _isVerbose
    process.env.GATSBY_REPORTER_ISVERBOSE = isVerbose ? `1` : `0`
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
  panic = (
    errorMeta: ErrorMeta,
    error?: Error | Array<Error>,
    pluginName?: string
  ): never => {
    this.error(errorMeta, error, pluginName)
    prematureEnd()
    return process.exit(1)
  }

  panicOnBuild = (
    errorMeta: ErrorMeta,
    error?: Error | Array<Error>,
    pluginName?: string
  ): IStructuredError | Array<IStructuredError> => {
    const reporterError = this.error(errorMeta, error, pluginName)
    if (process.env.gatsby_executing_command === `build`) {
      prematureEnd()
      process.exit(1)
    }
    return reporterError
  }

  error = (
    errorMeta: ErrorMeta | Array<ErrorMeta>,
    error?: Error | Array<Error>,
    pluginName?: string
  ): IStructuredError | Array<IStructuredError> => {
    let details: IConstructError["details"] = {
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
        ) as Array<IStructuredError>
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
      ) as Array<IStructuredError>
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

    if (pluginName) {
      details.pluginName = pluginName
      const id = details?.id

      if (id) {
        const isPrefixed = id.includes(`${pluginName}_`)
        if (!isPrefixed) {
          details.id = `${pluginName}_${id}`
        }
      }
    }

    const structuredError = constructError({ details }, this.errorMap)

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
    activityArgs: IActivityArgs = {},
    pluginName?: string
  ): ITimerReporter => {
    let { parentSpan, id, tags } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan, tags } : { tags }
    if (!id) {
      id = text
    }

    const span = tracer.startSpan(text, spanArgs)

    return createTimerReporter({
      text,
      id,
      span,
      reporter: this,
      reporterActions,
      pluginName,
    })
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
    let { parentSpan, id, tags } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan, tags } : { tags }
    if (!id) {
      id = text
    }

    const span = tracer.startSpan(text, spanArgs)

    return createPhantomReporter({ id, text, span, reporterActions })
  }

  /**
   * Create a progress bar for an activity
   */
  createProgress = (
    text: string,
    total = 0,
    start = 0,
    activityArgs: IActivityArgs = {},
    pluginName?: string
  ): IProgressReporter => {
    let { parentSpan, id, tags } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan, tags } : { tags }
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
      reporterActions,
      pluginName,
    })
  }

  // This method was called in older versions of gatsby, so we need to keep it to avoid
  // "reporter._setStage is not a function" error when gatsby@<2.16 is used with gatsby-cli@>=2.8
  _setStage = (): void => {}

  // This method is called by core when initializing worker process, so it can communicate with main process
  // and dispatch structured logs created by workers to parent process.
  _initReporterMessagingInWorker(sendMessage: (msg: ILogIntent) => void): void {
    const intentifiedActionCreators = {}
    for (const actionCreatorName of Object.keys(reduxReporterActions) as Array<
      keyof typeof reduxReporterActions
    >) {
      // swap each reporter action creator with function that send intent
      // to main process
      intentifiedActionCreators[actionCreatorName] = (...args): void => {
        sendMessage({
          type: `LOG_INTENT`,
          payload: {
            name: actionCreatorName,
            args,
          } as any,
        })
      }
    }
    reporterActions = intentifiedActionCreators as typeof reduxReporterActions
  }

  // This method is called by core when initializing worker pool, so main process can receive
  // messages from workers and dispatch structured logs created by workers to parent process.
  _initReporterMessagingInMain(
    onMessage: (listener: (msg: ILogIntent | unknown) => void) => void
  ): void {
    onMessage(msg => {
      if (isLogIntentMessage(msg)) {
        reduxReporterActions[msg.payload.name].call(
          reduxReporterActions,
          // @ts-ignore Next line (`...msg.payload.args`) cause "A spread argument
          // must either have a tuple type or be passed to a rest parameter"
          ...msg.payload.args
        )
      }
    })
  }

  _renderPageTree(args: IRenderPageArgs): void {
    reporterActions.renderPageTree(args)
  }

  _registerAdditionalDiagnosticOutputHandler(
    handler: AdditionalDiagnosticsOutputHandler
  ): void {
    registerAdditionalDiagnosticOutputHandler(handler)
  }
}
export type { Reporter }
export const reporter = new Reporter()
