import { Telemetry, IStats } from "./telemetry"
import { makeFlush } from "./flush"

const instance = new Telemetry()
const flush = makeFlush(instance.isTrackingEnabled())

process.on(`exit`, flush)

// For long running commands we want to occasionally flush the data
// The data is also sent on exit.

const interval = Number.isFinite(+process.env.TELEMETRY_BUFFER_INTERVAL!)
  ? Math.max(Number(process.env.TELEMETRY_BUFFER_INTERVAL), 1000)
  : 10 * 60 * 1000 // 10 min

const tick = (): void => {
  flush()
    .catch(console.error)
    .then(() => setTimeout(tick, interval))
}

export const trackCli = (
  input?: string | string[],
  tags?: {},
  opts?: { debounce: boolean }
): void => instance.captureEvent(input, tags, opts)

export const trackError = (input: string | number, tags?: {}): void =>
  instance.captureError(input, tags)

export const trackBuildError = (input: string | number, tags?: {}): void =>
  instance.captureBuildError(input, tags)

export const setDefaultTags = (tags: unknown): void =>
  instance.decorateAll(tags)

export const decorateEvent = (event: string | number, tags?: unknown): void =>
  instance.decorateNextEvent(event, tags)

export const setTelemetryEnabled = (enabled: boolean | undefined): void =>
  instance.setTelemetryEnabled(enabled)

export const startBackgroundUpdate = (): void => {
  setTimeout(tick, interval)
}

export const isTrackingEnabled = (): boolean => instance.isTrackingEnabled()

export const aggregateStats = (data: number[]): IStats =>
  instance.aggregateStats(data)

export const addSiteMeasurement = (
  event: string | number,
  obj: unknown
): void => instance.addSiteMeasurement(event, obj)

export const expressMiddleware = (source: string) => (
  _req,
  _res,
  next: () => void
): void => {
  try {
    instance.trackActivity(`${source}_ACTIVE`)
  } catch (e) {
    // ignore
  }
  next()
}

/** @deprecated use non-default exports. */
const _default = {
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

// TODO: Remove default export in v3.
export default _default
