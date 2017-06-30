exports.onRouteUpdate = function(newRoute) {
  // Don't track while developing.
  if (process.env.NODE_ENV === `production`) {
    ga(`set`, `page`, (newRoute.location || {}).pathname)
    ga(`send`, `pageview`)
  }
}
