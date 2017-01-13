import ReactGA from 'react-ga'

exports.clientEntry = (args, pluginOptions) => {
  ReactGA.initialize(pluginOptions.siteId)
}

exports.onRouteUpdate = function (location) {
  ReactGA.set({ page: window.location.pathname })
  ReactGA.pageview(window.location.pathname)
}
