import React, { useEffect } from "react"

/**
 * Attempts to occupy the main thread with work so that the idle strategy can be observed.
 */
export function OccupyMainThread({ seconds = 3000 }): JSX.Element {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log(`Occupying main thread`)
    }, 0)

    setTimeout(() => {
      clearInterval(interval)
    }, seconds)
  }, [])

  return <></>
}
