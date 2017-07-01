exports.onRouteUpdate = function({ location }) {
  // Don't track while developing.
  if (process.env.NODE_ENV === `production`) {
    ga(`set`, `page`, (location || {}).pathname)
    ga(`send`, `pageview`)
  }
}
