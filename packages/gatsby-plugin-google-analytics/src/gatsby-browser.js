function sendWebVitals() {
  return import(`web-vitals/base`).then(({ getLCP, getFID, getCLS }) => {
    getCLS(sendToGoogleAnalytics)
    getFID(sendToGoogleAnalytics)
    getLCP(sendToGoogleAnalytics)
  })
}

function sendToGoogleAnalytics({ name, delta, id }) {
  window.ga(`send`, `event`, {
    eventCategory: `Web Vitals`,
    eventAction: name,
    // The `id` value will be unique to the current page load. When sending
    // multiple values from the same page (e.g. for CLS), Google Analytics can
    // compute a total by grouping on this ID (note: requires `eventLabel` to
    // be a dimension in your report).
    eventLabel: id,
    // Google Analytics metrics must be integers, so the value is rounded.
    // For CLS the value is first multiplied by 1000 for greater precision
    // (note: increase the multiplier for greater precision if needed).
    eventValue: Math.round(name === `CLS` ? delta * 1000 : delta),
    // Use a non-interaction event to avoid affecting bounce rate.
    nonInteraction: true,
    // Use `sendBeacon()` if the browser supports it.
    transport: `beacon`,
  })
}

export const onRouteUpdate = ({ location }, pluginOptions = {}) => {
  const ga = window.ga
  if (process.env.NODE_ENV !== `production` || typeof ga !== `function`) {
    return null
  }

  const pathIsExcluded =
    location &&
    typeof window.excludeGAPaths !== `undefined` &&
    window.excludeGAPaths.some(rx => rx.test(location.pathname))

  if (pathIsExcluded) return null

  // wrap inside a timeout to make sure react-helmet is done with it's changes (https://github.com/gatsbyjs/gatsby/issues/9139)
  // reactHelmet is using requestAnimationFrame: https://github.com/nfl/react-helmet/blob/5.2.0/src/HelmetUtils.js#L296-L299
  const sendPageView = () => {
    const pagePath = location
      ? location.pathname + location.search + location.hash
      : undefined
    ga(`set`, `page`, pagePath)
    ga(`send`, `pageview`)
  }

  // Minimum delay for reactHelmet's requestAnimationFrame
  const delay = Math.max(32, pluginOptions.pageTransitionDelay || 0)
  setTimeout(sendPageView, delay)

  return null
}

export function onClientEntry(_, pluginOptions) {
  if (pluginOptions.enableWebVitalsTracking) {
    sendWebVitals()
  }
}
