/*
 * This module is used when calling reporter.
 * these logs
 */
import * as reporterActions from "./redux/actions"
import { ActivityStatuses, ActivityTypes } from "./constants"
import { Span } from "opentracing"
import { reporter as gatsbyReporter } from "./reporter"
import { IStructuredError } from "./structured-errors/types"
import { ErrorMeta, ITimerReporter } from "./types"

interface ICreateTimerReporterArguments {
  text: string
  id: string
  span: Span
  reporter: typeof gatsbyReporter
}

export const createTimerReporter = ({
  text,
  id,
  span,
  reporter,
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
      error?: Error | Error[]
    ): IStructuredError | IStructuredError[] {
      span.finish()

      reporterActions.setActivityErrored({
        id,
      })

      return reporter.panicOnBuild(errorMeta, error)
    },

    panic(errorMeta: ErrorMeta, error?: Error | Error[]): never {
      span.finish()

      reporterActions.endActivity({
        id,
        status: ActivityStatuses.Failed,
      })

      return reporter.panic(errorMeta, error)
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
