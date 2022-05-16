import { useEffect } from "react"

/**
 * Attempts to occupy the main thread with work so that the idle strategy can be observed.
 */
export function useOccupyMainThread(timeout = 3000) {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log(`Occupying main thread`)
    }, 0)

    setTimeout(() => {
      clearInterval(interval)
    }, timeout)
  }, [])
}
