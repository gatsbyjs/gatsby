import getPageLocalization from "./get-page-localization"

/**
 * Get a manifest filename depending on localized pathname
 *
 * @param {string} pathname
 * @param {Array<{start_url: string, lang: string}>} localizedManifests
 * @return string
 */
export default (pathname, localizedManifests) => {
  const { lang } = getPageLocalization(pathname, localizedManifests)
  return lang ? `manifest_${lang}.webmanifest` : `manifest.webmanifest`
}
