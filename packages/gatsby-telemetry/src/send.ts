import { AnalyticsTracker } from "./telemetry"
const instance = new AnalyticsTracker()

function flush(): void {
  instance.sendEvents().catch(e => {
    // ignore
  })
}

flush()
