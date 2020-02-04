/**
 * Get page `lang` and `start_url` depending on localized pathname
 *
 * @param {string} pathname
 * @param {Array<{start_url: string, lang: string}>} localizedManifests
 * @param {{start_url: string, lang: string}} defaultLocalization
 * @return {{start_url?: string, lang?: string}}
 */
export default (pathname, localizedManifests, defaultLocalization = {}) => {
  if (!Array.isArray(localizedManifests)) {
    return defaultLocalization
  }

  const localizedManifest = localizedManifests.find(app =>
    pathname.startsWith(app.start_url)
  )
  return localizedManifest || defaultLocalization
}
