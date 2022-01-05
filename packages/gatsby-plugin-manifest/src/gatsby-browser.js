/* global __MANIFEST_PLUGIN_HAS_LOCALISATION__ */
import { withPrefix } from "gatsby"
import getManifestForPathname from "./get-manifest-pathname"

// when we don't have localisation in our manifest, we tree shake everything away
if (__MANIFEST_PLUGIN_HAS_LOCALISATION__) {
  exports.onRouteUpdate = function ({ location }, pluginOptions) {
    const { localize } = pluginOptions
    const manifestFilename = getManifestForPathname(
      location.pathname,
      localize,
      true
    )

    const manifestEl = document.head.querySelector(`link[rel="manifest"]`)
    if (manifestEl) {
      manifestEl.setAttribute(`href`, withPrefix(manifestFilename))
    }
  }
}
