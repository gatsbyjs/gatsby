exports.onRouteUpdate = function({ location }) {
  // Don't track while developing.
  if (process.env.NODE_ENV === `production` && typeof ga === `function`) {
    // Wait for the title update (see #2478)
    setTimeout(() => {
      window.ga(`set`, `page`, (location || {}).pathname)
      window.ga(`send`, `pageview`)
    }, 0)
  }
}
