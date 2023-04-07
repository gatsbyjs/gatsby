import * as reporterActionsForTypes from "./redux/actions"
import { ActivityStatuses, ActivityTypes } from "./constants"
import { Span } from "opentracing"
import { reporter as gatsbyReporter } from "./reporter"
import { IStructuredError } from "../structured-errors/types"
import { ErrorMeta } from "./types"

interface ICreateProgressReporterArguments {
  id: string
  text: string
  start: number
  total: number
  span: Span
  reporter: typeof gatsbyReporter
  reporterActions: typeof reporterActionsForTypes
  pluginName?: string
}

export interface IProgressReporter {
  start(): void
  setStatus(statusText: string): void
  tick(increment?: number): void
  panicOnBuild(
    errorMeta: ErrorMeta,
    error?: Error | Array<Error>
  ): IStructuredError | Array<IStructuredError>
  panic(errorMeta: ErrorMeta, error?: Error | Array<Error>): never
  end(): void
  done(): void
  total: number
  span: Span
}

export const createProgressReporter = ({
  id,
  text,
  start,
  total,
  span,
  reporter,
  reporterActions,
  pluginName,
}: ICreateProgressReporterArguments): IProgressReporter => {
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
    start(): void {
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
      updateProgress(true)
      span.finish()
      reporterActions.endActivity({
        id,
        status: ActivityStatuses.Success,
      })
    },

    // @deprecated - use end()
    done(): void {
      updateProgress(true)
      span.finish()
      reporterActions.endActivity({
        id,
        status: ActivityStatuses.Success,
      })
    },

    set total(value: number) {
      total = unflushedTotal = value
      updateProgress()
    },

    get total(): number {
      return total
    },

    span,
  }
}
