const { guess } = require(`guess-webpack/api`)

exports.disableCorePrefetching = () => true

let initialPath
let notNavigated = true
exports.onRouteUpdate = ({ location }) => {
  if (initialPath !== location.pathname) {
    notNavigated = false
    return
  }
  initialPath = location.pathname
}

exports.onPrefetchPathname = ({ loadPage }, pluginOptions) => {
  if (process.env.NODE_ENV !== `production`) return

  const matchedPaths = Object.keys(
    guess({
      path: window.location.pathname,
      threshold: pluginOptions.minimumThreshold,
    })
  )

  // Don't prefetch from client for the initial path as we did that
  // during SSR
  if (!(notNavigated && initialPath === window.location.pathname)) {
    matchedPaths.forEach(loadPage)
  }
}
