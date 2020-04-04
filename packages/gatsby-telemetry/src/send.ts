import Telemetry from './telemetry'

const instance = new Telemetry()

const flush = () => {
  instance.sendEvents().catch(() => {
    // ignore
  })
}

flush()
