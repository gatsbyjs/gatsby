import { AnalyticsTracker, IAggregateStats } from "./telemetry"
import * as express from "express"

const instance = new AnalyticsTracker()

const flush = require(`./flush`)(instance.isTrackingEnabled())

process.on(`exit`, flush)

// For long running commands we want to occasionally flush the data
//
// The data is also sent on exit.

const interval = Number.isFinite(+process.env.TELEMETRY_BUFFER_INTERVAL)
  ? Math.max(Number(process.env.TELEMETRY_BUFFER_INTERVAL), 1000)
  : 10 * 60 * 1000 // 10 min

function tick(): void {
  flush()
    .catch(console.error)
    .then(() => setTimeout(tick, interval))
}

module.exports = {
  trackCli: (input, tags, opts): void =>
    instance.captureEvent(input, tags, opts),
  trackError: (input, tags): void => instance.captureError(input, tags),
  trackBuildError: (input, tags): void =>
    instance.captureBuildError(input, tags),
  setDefaultTags: (tags): void => instance.decorateAll(tags),
  decorateEvent: (event, tags): void => instance.decorateNextEvent(event, tags),
  setTelemetryEnabled: (enabled): void => instance.setTelemetryEnabled(enabled),
  startBackgroundUpdate: (): void => {
    setTimeout(tick, interval)
  },
  isTrackingEnabled: (): boolean => instance.isTrackingEnabled(),
  aggregateStats: (data): IAggregateStats => instance.aggregateStats(data),
  addSiteMeasurement: (event, obj): void =>
    instance.addSiteMeasurement(event, obj),
  expressMiddleware: function (source: string) {
    return function (req: express.Request, res: express.Response, next): void {
      try {
        instance.trackActivity(`${source}_ACTIVE`)
      } catch (e) {
        // ignore
      }
      next()
    }
  },
}
