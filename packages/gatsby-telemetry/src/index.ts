import Telemetry from './telemetry'
const instance = new Telemetry()

const flush = require(`./flush`)(instance.isTrackingEnabled())

process.on(`exit`, flush)

// For long running commands we want to occasionally flush the data
// The data is also sent on exit.

const TELEMETRY_BUFFER_INTERVAL: string | void = process.env.TELEMETRY_BUFFER_INTERVAL;

const interval = Number.isFinite(+TELEMETRY_BUFFER_INTERVAL)
  ? Math.max(Number(TELEMETRY_BUFFER_INTERVAL), 1000)
  : 10 * 60 * 1000 // 10 min

const tick = () => {
  flush()
    .catch(console.error)
    .then(() => setTimeout(tick, interval))
}

module.exports = {
  trackCli: (input, tags, opts) => instance.captureEvent(input, tags, opts),
  trackError: (input, tags) => instance.captureError(input, tags),
  trackBuildError: (input, tags) => instance.captureBuildError(input, tags),
  setDefaultTags: tags => instance.decorateAll(tags),
  decorateEvent: (event, tags) => instance.decorateNextEvent(event, tags),
  setTelemetryEnabled: enabled => instance.setTelemetryEnabled(enabled),
  startBackgroundUpdate: () => {
    setTimeout(tick, interval)
  },
  isTrackingEnabled: () => instance.isTrackingEnabled,
  aggregateStats: data => instance.aggregateStats(data),
  addSiteMeasurement: (event, obj) => instance.addSiteMeasurement(event, obj),
  expressMiddleware: source => (_, __, next) => {
    try {
      instance.trackActivity(`${source}_ACTIVE`)
    } catch (e) {
      // ignore
    }
    next()
  },
}
