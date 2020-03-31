import { Telemetry } from "./telemetry"
const instance = new Telemetry()

const flush = (): void => {
  instance.sendEvents().catch(() => {
    // ignore
  })
}

flush()
