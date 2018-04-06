exports.onRouteUpdate = function({ location }, pluginOptions) {
  // Don't track while developing.
  if (process.env.NODE_ENV === `production` && typeof ga === `function`) {
    if (
      location &&
      typeof pluginOptions.exclude !== `undefined` &&
      pluginOptions.exclude.some(rx => new RegExp(rx).test(location.pathname))
    ) {
      return
    }
    window.ga(
      `set`,
      `page`,
      location ? location.pathname + location.search + location.hash : undefined
    )
    window.ga(`send`, `pageview`)
  }
}
