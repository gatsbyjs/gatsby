import ReactGA from 'react-ga'

exports.clientEntry = (args, pluginOptions) => {
  // Don't track while developing.
  if (process.env.NODE_ENV === `production`) {
    ReactGA.initialize(pluginOptions.trackingId)
  }
}

exports.onRouteUpdate = function (location) {
  // Don't track while developing.
  if (process.env.NODE_ENV === `production`) {
    ReactGA.set({ page: location.pathname })
    ReactGA.pageview(location.pathname)
  }
}
