const defaultLang = "en"

function isDefaultLang(locale) {
  return locale === defaultLang
}

function localizedPath(locale, path) {
  const isIndex = path === `/`

  // TODO generalize this to other paths
  const isLocalized = !isDefaultLang(locale) && path.startsWith("/tutorial/")
  // If it's the default language, don't do anything
  // If it's another language, add the "path"
  // However, if the homepage/index page is linked don't add the "to"
  // Because otherwise this would add a trailing slash
  return isLocalized ? `${locale}${isIndex ? `` : `${path}`}` : path
}

module.exports = { defaultLang, localizedPath }
