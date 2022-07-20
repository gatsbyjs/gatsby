import { withPrefix } from "gatsby"

/**
 * Get a manifest filename depending on localized pathname
 *
 * @param {string} pathname
 * @param {Array<{start_url: string, lang: string}>} localizedManifests
 * @param {boolean} shouldPrependPathPrefix
 * @return string
 */
export default (
  pathname,
  localizedManifests,
  shouldPrependPathPrefix = false
) => {
  const defaultFilename = `manifest.webmanifest`
  if (!Array.isArray(localizedManifests)) {
    return defaultFilename
  }

  const localizedManifest = localizedManifests.find(app => {
    let startUrl = app.start_url
    if (shouldPrependPathPrefix) {
      startUrl = withPrefix(startUrl)
    }

    return pathname.startsWith(startUrl)
  })

  if (!localizedManifest) {
    return defaultFilename
  }

  return `manifest_${localizedManifest.lang}.webmanifest`
}
