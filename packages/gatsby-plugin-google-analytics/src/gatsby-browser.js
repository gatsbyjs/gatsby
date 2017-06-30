var lastPath = null
exports.onRouteUpdate = function(newRoute) {
  // Don't track while developing.
  if (process.env.NODE_ENV === `production`) {
    var newPath = newRoute.pathname || newRoute.location.pathname
    if (lastPath !== newPath) {
      lastPath = newPath
      ga(`set`, `page`, newPath)
      ga(`send`, `pageview`)
    }
  }
}
