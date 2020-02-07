exports.onRouteUpdate = ({ location, prevLocation }, pluginOptions) => {
  if (
    (process.env.NODE_ENV === `production` ||
      pluginOptions.includeInDevelopment) &&
    prevLocation·&&·prevLocation.pathname·!==·location.pathname
  ) {
    // wrap inside a timeout to ensure the title has properly been changed
    setTimeout(() => {
      let data = pluginOptions.dataLayerName
        ? window[pluginOptions.dataLayerName]
        : window.dataLayer

      data.push({ event: `gatsby-route-change` })
    }, 50)
  }
}
