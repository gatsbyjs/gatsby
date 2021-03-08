/* eslint-disable no-unused-expressions */
import { RefObject } from "react"

let intersectionObserver: IntersectionObserver

type Unobserver = () => void

const ioEntryMap = new WeakMap<HTMLElement, () => void>()
/* eslint-disable @typescript-eslint/no-explicit-any  */
const connection =
  (navigator as any).connection ||
  (navigator as any).mozConnection ||
  (navigator as any).webkitConnection
/* eslint-enable @typescript-eslint/no-explicit-any */

// These match the thresholds used in Chrome's native lazy loading
// @see https://web.dev/browser-level-image-lazy-loading/#distance-from-viewport-thresholds
const FAST_CONNECTION_THRESHOLD = `1250px`
const SLOW_CONNECTION_THRESHOLD = `2500px`

export function createIntersectionObserver(
  callback: () => void
): (element: RefObject<HTMLElement | undefined>) => Unobserver {
  const connectionType = connection?.effectiveType

  // if we don't support intersectionObserver we don't lazy load (Sorry IE 11).
  if (!(`IntersectionObserver` in window)) {
    return function observe(): Unobserver {
      callback()
      return function unobserve(): void {}
    }
  }

  if (!intersectionObserver) {
    intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Get the matching entry's callback and call it
            ioEntryMap.get(entry.target as HTMLElement)?.()
            // We only need to call it once
            ioEntryMap.delete(entry.target as HTMLElement)
          }
        })
      },
      {
        rootMargin:
          connectionType === `4g` && !connection?.saveData
            ? FAST_CONNECTION_THRESHOLD
            : SLOW_CONNECTION_THRESHOLD,
      }
    )
  }

  return function observe(
    element: RefObject<HTMLElement | undefined>
  ): Unobserver {
    if (element.current) {
      // Store a reference to the callback mapped to the element being watched
      ioEntryMap.set(element.current, callback)
      intersectionObserver.observe(element.current)
    }

    return function unobserve(): void {
      if (intersectionObserver && element.current) {
        ioEntryMap.delete(element.current)
        intersectionObserver.unobserve(element.current)
      }
    }
  }
}
