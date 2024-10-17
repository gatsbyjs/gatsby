/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  AnalyticsTracker,
  IAggregateStats,
  ITelemetryTagsPayload,
  ITelemetryOptsPayload,
  IDefaultTelemetryTagsPayload,
} from "./telemetry"
import type { Request, Response } from "express"

export const flush = (): Promise<void> => Promise.resolve()

export function trackFeatureIsUsed(_name: string): void {
  // no_op
}

export function trackCli(
  _input: string | Array<string>,
  _tags?: ITelemetryTagsPayload,
  _opts?: ITelemetryOptsPayload
): void {
  // no_op
}

export function captureEvent(
  _input: string | Array<string>,
  _tags?: ITelemetryTagsPayload,
  _opts?: ITelemetryOptsPayload
): void {
  // no_op
}

export function trackError(
  _input: string,
  _tags?: ITelemetryTagsPayload
): void {
  // no_op
}

export function trackBuildError(
  _input: string,
  _tags?: ITelemetryTagsPayload
): void {
  // no_op
}

export function setDefaultTags(_tags: IDefaultTelemetryTagsPayload): void {
  // no_op
}

export function decorateEvent(
  _event: string,
  _tags?: Record<string, unknown>
): void {
  // no_op
}

export function setTelemetryEnabled(_enabled: boolean): void {
  // no_op
}

export function startBackgroundUpdate(): void {
  // no_op
}

export function isTrackingEnabled(): boolean {
  return false
}

export function aggregateStats(data: Array<number>): IAggregateStats {
  const sum = data.reduce((acc, x) => acc + x, 0)
  const mean = sum / data.length || 0
  const median = data.sort()[Math.floor((data.length - 1) / 2)] || 0
  const stdDev =
    Math.sqrt(
      data.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0) /
        (data.length - 1)
    ) || 0

  const skewness =
    data.reduce((acc, x) => acc + Math.pow(x - mean, 3), 0) /
    data.length /
    Math.pow(stdDev, 3)

  return {
    count: data.length,
    min: data.reduce((acc, x) => (x < acc ? x : acc), data[0] || 0),
    max: data.reduce((acc, x) => (x > acc ? x : acc), 0),
    sum: sum,
    mean: mean,
    median: median,
    stdDev: stdDev,
    skewness: !Number.isNaN(skewness) ? skewness : 0,
  }
}

export function addSiteMeasurement(
  _event: string,
  _obj: ITelemetryTagsPayload["siteMeasurements"]
): void {
  // no_op
}

export function expressMiddleware(_source: string) {
  return function (_req: Request, _res: Response, next): void {
    // no_op
    next()
  }
}

// Internal
export function setDefaultComponentId(_componentId: string): void {
  // no_op
}

export function setGatsbyCliVersion(_version: string): void {
  // no_op
}

export {
  AnalyticsTracker,
  IAggregateStats,
  ITelemetryTagsPayload,
  ITelemetryOptsPayload,
  IDefaultTelemetryTagsPayload,
}

module.exports = {
  addSiteMeasurement,
  aggregateStats,
  captureEvent,
  decorateEvent,
  expressMiddleware,
  flush,
  isTrackingEnabled,
  setDefaultComponentId,
  setDefaultTags,
  setGatsbyCliVersion,
  setTelemetryEnabled,
  startBackgroundUpdate,
  trackBuildError,
  trackCli,
  trackError,
  trackFeatureIsUsed,
}
