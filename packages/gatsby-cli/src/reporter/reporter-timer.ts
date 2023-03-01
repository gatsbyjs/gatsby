/*
 * This module is used when calling reporter.
 * these logs
 */
import * as reporterActionsForTypes from "./redux/actions"
import { ActivityStatuses, ActivityTypes } from "./constants"
import { Span } from "opentracing"
import { reporter as gatsbyReporter } from "./reporter"
import { IStructuredError } from "../structured-errors/types"
import { ErrorMeta } from "./types"

interface ICreateTimerReporterArguments {
  text: string
  id: string
  span: Span
  reporter: typeof gatsbyReporter
  reporterActions: typeof reporterActionsForTypes
  pluginName?: string
}

export interface ITimerReporter {
  start(): void
  setStatus(statusText: string): void
  panicOnBuild(
    errorMeta: ErrorMeta,
    error?: Error | Array<Error>
  ): IStructuredError | Array<IStructuredError>
  panic(errorMeta: ErrorMeta, error?: Error | Array<Error>): never
  end(): void
  span: Span
}

export const createTimerReporter = ({
  text,
  id,
  span,
  reporter,
  reporterActions,
  pluginName,
}: ICreateTimerReporterArguments): ITimerReporter => {
  return {
    start(): void {
      reporterActions.startActivity({
        id,
        text: text || `__timer__`,
        type: ActivityTypes.Spinner,
      })
    },

    setStatus(statusText: string): void {
      reporterActions.setActivityStatusText({
        id,
        statusText,
      })
    },

    panicOnBuild(
      errorMeta: ErrorMeta,
      error?: Error | Array<Error>
    ): IStructuredError | Array<IStructuredError> {
      span.finish()

      reporterActions.setActivityErrored({
        id,
      })

      return reporter.panicOnBuild(errorMeta, error, pluginName)
    },

    panic(errorMeta: ErrorMeta, error?: Error | Array<Error>): never {
      span.finish()

      reporterActions.endActivity({
        id,
        status: ActivityStatuses.Failed,
      })

      return reporter.panic(errorMeta, error, pluginName)
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
