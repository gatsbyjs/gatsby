import { useLocation } from "@reach/router"
import { useEffect } from "react"
import { useTelemetry } from "../utils/use-telemetry"

export function PageviewTracker(): null {
  const location = useLocation()
  const { trackEvent } = useTelemetry()

  useEffect(() => {
    trackEvent(`PAGEVIEW`, {
      pathname: location.pathname,
    })
  }, [location.pathname])

  return null
}
