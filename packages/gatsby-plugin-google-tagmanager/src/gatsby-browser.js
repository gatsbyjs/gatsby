function sendWebVitals(dataLayerName = `dataLayer`) {
  const win = window
  return import(/* webpackMode: "lazy-once" */ `web-vitals`).then(
    ({ getLCP, getFID, getCLS }) => {
      getCLS(data => sendToGoogleAnalytics(data, win[dataLayerName]))
      getFID(data => sendToGoogleAnalytics(data, win[dataLayerName]))
      getLCP(data => sendToGoogleAnalytics(data, win[dataLayerName]))
    }
  )
}

function sendToGoogleAnalytics({ name, delta, id }, dataLayer) {
  dataLayer.push({
    event: `core-web-vitals`,
    webVitalsMeasurement: {
      name: name,
      // The `id` value will be unique to the current page load. When sending
      // multiple values from the same page (e.g. for CLS), Google Analytics can
      // compute a total by grouping on this ID (note: requires `eventLabel` to
      // be a dimension in your report).
      id,
      // Google Analytics metrics must be integers, so the value is rounded.
      // For CLS the value is first multiplied by 1000 for greater precision
      // (note: increase the multiplier for greater precision if needed).
      value: Math.round(name === `CLS` ? delta * 1000 : delta),
    },
  })
}

export function onRouteUpdate(_, pluginOptions) {
  if (
    process.env.NODE_ENV === `production` ||
    pluginOptions.includeInDevelopment
  ) {
    // wrap inside a timeout to ensure the title has properly been changed
    setTimeout(() => {
      const data = pluginOptions.dataLayerName
        ? window[pluginOptions.dataLayerName]
        : window.dataLayer
      const eventName = pluginOptions.routeChangeEventName
        ? pluginOptions.routeChangeEventName
        : `gatsby-route-change`

      data.push({ event: eventName })
    }, 50)
  }
}

export function onClientEntry(_, pluginOptions) {
  if (pluginOptions.enableWebVitalsTracking) {
    sendWebVitals(pluginOptions.dataLayerName)
  }
}
