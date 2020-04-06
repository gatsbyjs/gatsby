import reporterActions from "./redux/actions"
import { ActivityStatuses, ActivityTypes } from "./constants"
import { Span } from "opentracing"
import { reporter as gatsbyReporter } from "./reporter"

export interface ICreateProgressReporterArguments {
  id: string
  text: string
  start: number
  total: number
  span: Span
  reporter: typeof gatsbyReporter
}

export type ProgressReporter = ReturnType<typeof createProgressReporter>

export const createProgressReporter = ({
  id,
  text,
  start,
  total,
  span,
  reporter,
}: ICreateProgressReporterArguments) => {
  let lastUpdateTime = 0
  let unflushedProgress = 0
  let unflushedTotal = 0
  const progressUpdateDelay = Math.round(1000 / 10) // 10 fps *shrug*

  const updateProgress = (forced: boolean = false): void => {
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

  return {
    start() {
      reporterActions.startActivity({
        id,
        text,
        type: ActivityTypes.Progress,
        current: start,
        total,
      })
    },

    setStatus(statusText: string): void {
      reporterActions.setActivityStatusText({
        id,
        statusText,
      })
    },

    tick(increment: number = 1): void {
      unflushedProgress += increment // Have to manually track this :/
      updateProgress()
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

    done(): void {
      updateProgress(true)
      span.finish()
      reporterActions.endActivity({
        id,
        status: ActivityStatuses.Success,
      })
    },

    set total(value: number) {
      unflushedTotal = value
      updateProgress()
    },

    span,
  }
}
