import React from "react"
import { ErrorBoundary } from "react-error-boundary"
import { useTelemetry } from "../utils/use-telemetry"

export function ErrorTracker({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const { trackError } = useTelemetry()

  return (
    <ErrorBoundary
      fallbackRender={() => (
        <div>
          <h1>Oops, something went wrong :(</h1>
          <p>Please refresh the page to try again.</p>
        </div>
      )}
      onError={err =>
        trackError(`ERROR`, {
          error: err,
        })
      }
    >
      {children}
    </ErrorBoundary>
  )
}
