/**
 * Get a manifest filename depending on localized pathname
 *
 * @param {string} pathname
 * @param {Array<{start_url: string, lang: string}>} localizedManifests
 * @return string
 */
export default (pathname, localizedManifests) => {
  const defaultFilename = `manifest.webmanifest`
  if (!Array.isArray(localizedManifests)) {
    return defaultFilename
  }

  const localizedManifest = localizedManifests.find(app =>
    pathname.startsWith(app.start_url)
  )

  if (!localizedManifest) {
    return defaultFilename
  }

  return `manifest_${localizedManifest.lang}.webmanifest`
}
