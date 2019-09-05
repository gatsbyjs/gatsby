import { withPrefix as fallbackWithPrefix, withAssetPrefix } from "gatsby"

const withPrefix = withAssetPrefix || fallbackWithPrefix

exports.onRouteUpdate = function({ location }, pluginOptions) {
  const { localize } = pluginOptions
  const manifestFilename = getManifestForPathname(location.pathname, localize)

  const manifestEl = document.head.querySelector(`link[rel="manifest"]`)
  if (manifestEl) {
    manifestEl.setAttribute(`href`, withPrefix(manifestFilename))
  }
}

function getManifestForPathname(pathname, localizedApps) {
  let suffix = ``
  if (Array.isArray(localizedApps)) {
    const appOptions = localizedApps.find(app =>
      RegExp(`^${app.start_url}.*`, `i`).test(pathname)
    )
    if (appOptions) {
      suffix = `_${appOptions.lang}`
    }
  }
  return `manifest${suffix}.webmanifest`
}
