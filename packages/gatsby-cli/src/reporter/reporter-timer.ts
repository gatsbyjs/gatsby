/*
 * This module is used when calling reporter.
 * these logs
 */
import reporterActions from "./redux/actions"
import { ActivityStatuses, ActivityTypes } from "./constants"
import { Span } from "opentracing"
import { reporter as gatsbyReporter } from "./reporter"

export interface ICreateTimerReporterArgumnents {
  text: string
  id: string
  span: Span
  reporter: typeof gatsbyReporter
}

export type TimerReporter = ReturnType<typeof createTimerReporter>

export const createTimerReporter = ({
  text,
  id,
  span,
  reporter,
}: ICreateTimerReporterArgumnents) => {
  return {
    start(): void {
      reporterActions.startActivity({
        id,
        text,
        type: ActivityTypes.Spinner,
      })
    },
    setStatus(statusText: string): void {
      reporterActions.setActivityStatusText({
        id,
        statusText,
      })
    },
    // TODO: I wish this could also be typed better,
    // but our usages are sooo across the board right now
    panicOnBuild(arg: any, ...otherArgs: any[]) {
      span.finish()

      reporterActions.setActivityErrored({
        id,
      })

      return reporter.panicOnBuild(arg, ...otherArgs)
    },
    // TODO: I wish this could also be typed better,
    // but our usages are sooo across the board right now
    panic(arg: any, ...otherArgs: any[]) {
      span.finish()

      reporterActions.endActivity({
        id,
        status: ActivityStatuses.Failed,
      })

      return reporter.panic(arg, ...otherArgs)
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
