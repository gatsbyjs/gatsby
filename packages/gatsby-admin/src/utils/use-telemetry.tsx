import { useServices } from "../components/services-provider"

interface ITelemetry {
  trackEvent: (
    input: string | Array<string>,
    tags?: { pluginName?: string; pathname?: string }
  ) => void
  trackError: (input: string | Array<string>, tags: { error: Error }) => void
}

const noop = (): void => {}

const errorToJSON = (err): Record<string, any> => {
  const json = JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
  return {
    ...json,
    stack: json.stack.replace(
      new RegExp(`${window.location.protocol}//${window.location.host}`, `g`),
      `$URL`
    ),
  }
}

export const useTelemetry = (): ITelemetry => {
  const services = useServices()
  if (!services.telemetryserver)
    return {
      trackEvent: noop,
      trackError: noop,
    }

  const { port } = services.telemetryserver

  const trackEvent: ITelemetry["trackEvent"] = (input, tags) => {
    fetch(`http://localhost:${port}/trackEvent`, {
      method: `POST`,
      body: JSON.stringify([input, tags]),
      headers: {
        "Content-Type": `application/json`,
      },
    }).catch(() => {})
    return
  }

  const trackError: ITelemetry["trackError"] = (input, tags) => {
    fetch(`http://localhost:${port}/trackError`, {
      method: `POST`,
      body: JSON.stringify([
        input,
        {
          ...tags,
          error: errorToJSON(tags.error),
        },
      ]),
      headers: {
        "Content-Type": `application/json`,
      },
    }).catch(() => {})
    return
  }

  return {
    trackEvent,
    trackError,
  }
}
