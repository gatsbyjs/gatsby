exports.onRouteUpdate = (_, pluginOptions) => {
  if (
    process.env.NODE_ENV === `production` ||
    pluginOptions.includeInDevelopment
  ) {
    // wrap inside a timeout to ensure the title has properly been changed
    setTimeout(() => {
      window.dataLayer.push({ event: `gatsby-route-change` })
    }, 50)
  }
}
