/**
 * Detection code adapted from:
 * https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
 */

let didCheck = false
let isSupportedCached = false

export function supportsPassiveListener(): boolean {
  if (didCheck) {
    return isSupportedCached
  }
  // Test via a getter in the options object to see if the passive property is accessed
  try {
    const opts = Object.defineProperty({}, `passive`, {
      get: function (): void {
        isSupportedCached = true
        return undefined
      },
    })
    const noop = (): void => {}
    window.addEventListener(`scroll`, noop, opts)
    window.removeEventListener(`scroll`, noop, opts)
  } catch (e) {
    isSupportedCached = false
  }
  didCheck = true
  return isSupportedCached
}
