import {
  AnalyticsTracker,
  IAggregateStats,
  ITelemetryTagsPayload,
  ITelemetryOptsPayload,
} from "./telemetry"
import * as express from "express"
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
  input: string | string[],
  tags?: ITelemetryTagsPayload,
  opts?: ITelemetryOptsPayload
): void {
  instance.captureEvent(input, tags, opts)
}

export function trackError(input, tags): void {
  instance.captureError(input, tags)
}

export function trackBuildError(input, tags): void {
  instance.captureBuildError(input, tags)
}

export function setDefaultTags(tags): void {
  instance.decorateAll(tags)
}

export function decorateEvent(event, tags): void {
  instance.decorateNextEvent(event, tags)
}

export function setTelemetryEnabled(enabled): void {
  instance.setTelemetryEnabled(enabled)
}

export function startBackgroundUpdate(): void {
  setTimeout(tick, interval)
}

export function isTrackingEnabled(): boolean {
  return instance.isTrackingEnabled()
}

export function aggregateStats(data): IAggregateStats {
  return instance.aggregateStats(data)
}

export function addSiteMeasurement(event, obj): void {
  instance.addSiteMeasurement(event, obj)
}

export function expressMiddleware(source: string) {
  return function (_req: express.Request, _res: express.Response, next): void {
    try {
      instance.trackActivity(`${source}_ACTIVE`)
    } catch (e) {
      // ignore
    }
    next()
  }
}

// Internal
export function setDefaultComponentId(componentId): void {
  instance.componentId = componentId
}

export function setGatsbyCliVersion(version): void {
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
}
