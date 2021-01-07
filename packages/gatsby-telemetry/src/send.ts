import { AnalyticsTracker } from "./telemetry"
const instance = new AnalyticsTracker()

function flush(): void {
  instance.sendEvents().catch(_e => {
    // ignore
  })
}

flush()
