const allLangs = require("../../i18n.json")
const defaultLang = "en"

// Only allow languages defined in the LOCALES env variable.
// This allows us to compile only languages that are "complete" or test only
// a single language
function getLanguages() {
  // If `LOCALES` isn't defined, only have default language (English)
  if (!process.env.LOCALES) {
    return []
  }

  const langCodes = process.env.LOCALES.split(" ")
  const langs = []
  for (let code of langCodes) {
    const lang = allLangs.find(lang => lang.code === code)
    // Error if one of the locales provided isn't a valid locale
    if (!lang) {
      throw new Error(
        `Invalid locale provided: ${code}. See i18n.json for the list of available locales.`
      )
    }
    langs.push(lang)
  }
  return langs
}

const langs = getLanguages()
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

module.exports = {
  langCodes,
  langs,
  defaultLang,
  localizedPath,
  getLocaleAndBasePath,
}
