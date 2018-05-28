const Prism = require(`prismjs`)
const components = require(`prismjs/components`)

module.exports = function loadPrismLanguage(language) {
  if (Prism.languages[language]) {
    // Don't load already loaded language
    return
  }

  const languageData = components.languages[language]
  if (!languageData) {
    throw new Error(`Prism doesn't support language '${language}'.`)
  }

  if (languageData.option === `default`) {
    // Default language has already been loaded by Prism
    return
  }

  if (languageData.require) {
    // Load the required language first
    if (Array.isArray(languageData.require)) {
      languageData.require.forEach(loadPrismLanguage)
    } else {
      loadPrismLanguage(languageData.require)
    }
  }

  require(`prismjs/components/prism-${language}.js`)
}
