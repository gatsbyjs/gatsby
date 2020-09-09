import {
  AnalyticsTracker,
  IAggregateStats,
  ITelemetryTagsPayload,
  ITelemetryOptsPayload,
  IDefaultTelemetryTagsPayload,
} from "./telemetry"
import { Request, Response } from "express"
import { createFlush } from "./create-flush"

const instance = new AnalyticsTracker()

const flush = createFlush(instance.isTrackingEnabled())

process.on(`exit`, flush)

// For long running commands we want to occasionally flush the data
//
// The data is also sent on exit.

const intervalDuration = process.env.TELEMETRY_BUFFER_INTERVAL
const interval =
  intervalDuration && Number.isFinite(+intervalDuration)
    ? Math.max(Number(intervalDuration), 1000)
    : 10 * 60 * 1000 // 10 min

function tick(): void {
  flush()
    .catch(console.error)
    .then(() => setTimeout(tick, interval))
}

export function trackFeatureIsUsed(name: string): void {
  instance.trackFeatureIsUsed(name)
}
export function trackCli(
  input: string | Array<string>,
  tags?: ITelemetryTagsPayload,
  opts?: ITelemetryOptsPayload
): void {
  instance.captureEvent(input, tags, opts)
}

export function trackError(input: string, tags?: ITelemetryTagsPayload): void {
  instance.captureError(input, tags)
}

export function trackBuildError(
  input: string,
  tags?: ITelemetryTagsPayload
): void {
  instance.captureBuildError(input, tags)
}

export function setDefaultTags(tags: IDefaultTelemetryTagsPayload): void {
  instance.decorateAll(tags)
}

export function decorateEvent(
  event: string,
  tags?: Record<string, unknown>
): void {
  instance.decorateNextEvent(event, tags)
}

export function setTelemetryEnabled(enabled: boolean): void {
  instance.setTelemetryEnabled(enabled)
}

export function startBackgroundUpdate(): void {
  setTimeout(tick, interval)
}

export function isTrackingEnabled(): boolean {
  return instance.isTrackingEnabled()
}

export function aggregateStats(data: Array<number>): IAggregateStats {
  return instance.aggregateStats(data)
}

export function addSiteMeasurement(event: string, obj): void {
  instance.addSiteMeasurement(event, obj)
}

export function expressMiddleware(source: string) {
  return function (_req: Request, _res: Response, next): void {
    try {
      instance.trackActivity(`${source}_ACTIVE`)
    } catch (e) {
      // ignore
    }
    next()
  }
}

// Internal
export function setDefaultComponentId(componentId: string): void {
  instance.componentId = componentId
}

export function setGatsbyCliVersion(version: string): void {
  instance.gatsbyCliVersion = version
}

module.exports = {
  trackFeatureIsUsed,
  trackCli,
  trackError,
  trackBuildError,
  setDefaultTags,
  decorateEvent,
  setTelemetryEnabled,
  startBackgroundUpdate,
  isTrackingEnabled,
  aggregateStats,
  addSiteMeasurement,
  expressMiddleware,
  setDefaultComponentId,
  setGatsbyCliVersion,
}
