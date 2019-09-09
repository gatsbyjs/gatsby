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
  const defaultFilename = `manifest.webmanifest`
  if (!Array.isArray(localizedApps)) {
    return defaultFilename
  }

  const appOptions = localizedApps.find(app =>
    RegExp(`^${app.start_url}.*`, `i`).test(pathname)
  )
  if (!appOptions) {
    return defaultFilename
  }

  return `manifest_${appOptions.lang}.webmanifest`
}
