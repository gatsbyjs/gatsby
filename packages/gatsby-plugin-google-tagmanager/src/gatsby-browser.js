const listOfMetricsSend = new Set()

function debounce(fn, timeout) {
  let timer = null

  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(fn, timeout, ...args)
  }
}

function sendWebVitals(dataLayerName = `dataLayer`) {
  const win = window

  function sendData(data) {
    if (listOfMetricsSend.has(data.name)) {
      return
    }
    listOfMetricsSend.add(data.name)

    sendToGTM(data, win[dataLayerName])
  }

  return import(`web-vitals/base`).then(({ getLCP, getFID, getCLS }) => {
    const debouncedCLS = debounce(sendData, 3000)
    // we don't need to debounce FID - we send it when it happens
    const debouncedFID = sendData
    // LCP can occur multiple times so we debounce it
    const debouncedLCP = debounce(sendData, 3000)

    // With the true flag, we measure all previous occurences too, in case we start listening to late.
    getCLS(debouncedCLS, true)
    getFID(debouncedFID, true)
    getLCP(debouncedLCP, true)
  })
}

function sendToGTM({ name, value, id }, dataLayer) {
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
      value: Math.round(name === `CLS` ? value * 1000 : value),
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

export function onInitialClientRender(_, pluginOptions) {
  if (pluginOptions.enableWebVitalsTracking) {
    sendWebVitals(pluginOptions.dataLayerName)
  }
}
