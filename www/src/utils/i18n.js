const allLangs = require("../../i18n.json")
const defaultLang = "en"

// Only allow languages defined in the LOCALES env variable.
// This allows us to compile only languages that are "complete" or test only
// a single language
function getLanguages(localeStr) {
  // If `LOCALES` isn't defined, only have default language (English)
  if (!localeStr) {
    return []
  }

  const langCodes = localeStr.split(" ")
  const langs = []
  for (let code of langCodes) {
    if (code === defaultLang) {
      throw new Error(
        `${code} is the default locale and should not be put in the locale list.`
      )
    }
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

const langs = getLanguages(process.env.LOCALES)
const langCodes = langs.map(lang => lang.code)

function isDefaultLang(locale) {
  return locale === defaultLang
}

/**
 * Get the path prefixed with the locale
 * @param {string} locale the locale to prefix with
 * @param {string} path the path to prefix
 */
function localizedPath(locale, path) {
  // Our default language isn't prefixed for back-compat
  if (isDefaultLang(locale)) {
    return path
  }

  const [, base] = path.split(`/`)

  // If for whatever reason we receive an already localized path
  // (e.g. if the path was made with location.pathname)
  // just return it as-is.
  if (base === locale) {
    return path
  }

  // If it's another language, prefix with the locale
  return `/${locale}${path}`
}

/**
 * Split a path into its locale and base path.
 *
 * e.g. /es/tutorial/ -> { locale: "es", basePath: "/tutorial/"}
 * @param {string} path the path to extract locale information from
 * @param {Array} langCodes a list of valid language codes, defaulting to
 * the ones defined in `process.env.LOCALES`
 */
function getLocaleAndBasePath(path, codes = langCodes) {
  const [, code, ...rest] = path.split("/")
  if (codes.includes(code)) {
    return { locale: code, basePath: `/${rest.join("/")}` }
  }
  return { locale: defaultLang, basePath: path }
}

module.exports = {
  langCodes,
  langs,
  defaultLang,
  getLanguages,
  localizedPath,
  getLocaleAndBasePath,
}
