const langs = require("../../i18n.json")
const defaultLang = "en"

const langCodes = langs.map(lang => lang.code)

const localizedSections = ["tutorial"]

function isDefaultLang(locale) {
  return locale === defaultLang
}

/**
 * Get the path prefixed with the locale
 * @param {*} locale the locale to prefix with
 * @param {*} path the path to prefix
 */
function localizedPath(locale, path) {
  const isIndex = path === `/`

  // Our default language isn't prefixed for back-compat
  if (isDefaultLang(locale)) {
    return path
  }

  const [, base] = path.split("/")

  // If for whatever reason we receive an already localized path
  // (e.g. if the path was made with location.pathname)
  // just return it as-is.
  if (langCodes.includes(base)) {
    return path
  }

  // Only localize paths for localized sections
  if (!localizedSections.includes(base)) {
    return path
  }

  // If it's another language, add the "path"
  // However, if the homepage/index page is linked don't add the "to"
  // Because otherwise this would add a trailing slash
  return `${locale}${isIndex ? `` : `${path}`}`
}

/**
 * Split a path into its locale and base path.
 *
 * e.g. /es/tutorial/ -> { locale: "es", basePath: "/tutorial/"}
 * @param {string} path the path to extract locale information from
 */
function getLocaleAndBasePath(path) {
  const [, code, ...rest] = path.split("/")
  if (langCodes.includes(code)) {
    return { locale: code, basePath: `/${rest.join("/")}` }
  }
  return { locale: defaultLang, basePath: path }
}

module.exports = { defaultLang, localizedPath, getLocaleAndBasePath }
