/* global __MANIFEST_PLUGIN_HAS_LOCALISATION__ */
import { withPrefix as fallbackWithPrefix, withAssetPrefix } from "gatsby"

// when we don't have localisation in our manifest, we tree shake everything away
if (__MANIFEST_PLUGIN_HAS_LOCALISATION__) {
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
      pathname.startsWith(app.start_url)
    )

    if (!appOptions) {
      return defaultFilename
    }

    return `manifest_${appOptions.lang}.webmanifest`
  }
}
