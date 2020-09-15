import { useServices } from "../components/services-provider"

interface ITelemetry {
  trackEvent: (
    input: string | Array<string>,
    tags?: { pluginName?: string }
  ) => void
}

const noop = (): void => {}

export const useTelemetry = (): ITelemetry => {
  const services = useServices()
  if (!services.telemetryserver)
    return {
      trackEvent: noop,
    }

  const { port } = services.telemetryserver

  const trackEvent: ITelemetry["trackEvent"] = input => {
    fetch(`http://localhost:${port}/trackEvent`, {
      method: `POST`,
      body: JSON.stringify([input]),
      headers: {
        "Content-Type": `application/json`,
      },
    }).catch(() => {})
    return
  }

  return {
    trackEvent,
  }
}
