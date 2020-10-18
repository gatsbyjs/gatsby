exports.onRouteUpdate = (_, pluginOptions) => {
  if (
    process.env.NODE_ENV === `production` ||
    pluginOptions.includeInDevelopment
  ) {
    // wrap inside a timeout to ensure the title has properly been changed
    setTimeout(() => {
      let data = pluginOptions.dataLayerName
        ? window[pluginOptions.dataLayerName]
        : window.dataLayer
      let eventName = pluginOptions.routeChangeEventName
        ? pluginOptions.routeChangeEventName
        : `gatsby-route-change`

      data.push({ event: eventName })
    }, 50)
  }
}
