exports.onRouteUpdate = function({ location }, pluginOptions) {
  let { enabled } = pluginOptions
  let isEnabled
  if (typeof enabled === `boolean`) {
    isEnabled = enabled
  } else if (enabled && enabled !== `auto`) {
    // If user specifies any value that is truthy but NOT the string `auto` it's invalid
    throw new Error(
      `[gatsby-plugin-google-analytics] Valid options for 'enabled' flag: true, false, or 'auto'`
    )
  } else {
    // Default value, if `enabled` option is not specified
    isEnabled = process.env.NODE_ENV === `production`
  }

  // Don't track while developing, or follow the `enabled` option value
  if (isEnabled && typeof ga === `function`) {
    if (
      location &&
      typeof window.excludeGAPaths !== `undefined` &&
      window.excludeGAPaths.some(rx => rx.test(location.pathname))
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
