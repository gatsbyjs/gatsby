exports.onRouteUpdate = function({ location }) {
  // Don't track while developing.
  if (process.env.NODE_ENV === `production` && typeof ga === `function`) {
    window.ga(`set`, `page`, (location || {}).pathname)
    window.ga(`send`, `pageview`)
  }
}
