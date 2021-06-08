const Prism = require(`prismjs`)
const loadPrismLanguage = require(`./load-prism-language`)
const handleDirectives = require(`./directives`)
const escapeHTML = require(`./escape-html`)
const unsupportedLanguages = new Set()

require(`prismjs/components/prism-diff`)
require(`prismjs/plugins/diff-highlight/prism-diff-highlight`)

module.exports = (
  language,
  code,
  additionalEscapeCharacters = {},
  lineNumbersOutput = [],
  lineNumbersHighlight = [],
  noInlineHighlight = false,
  diffLanguage = null
) => {
  // (Try to) load languages on demand.
  if (!Prism.languages[language]) {
    try {
      loadPrismLanguage(language)
    } catch (e) {
      // Language wasn't loaded so let's bail.
      let message = null
      switch (language) {
        case `none`:
          return code // Don't escape if set to none.
        case `text`:
          message = noInlineHighlight
            ? `code block language not specified in markdown.`
            : `code block or inline code language not specified in markdown.`
          break
        default:
          message = `unable to find prism language '${language}' for highlighting.`
      }

      const lang = language.toLowerCase()
      if (!unsupportedLanguages.has(lang)) {
        console.warn(message, `applying generic code block`)
        unsupportedLanguages.add(lang)
      }
      return escapeHTML(code, additionalEscapeCharacters)
    }
  }

  // (Try to) load diffLanguage on demand.
  if (diffLanguage && !Prism.languages[diffLanguage]) {
    try {
      loadPrismLanguage(diffLanguage)
    } catch (e) {
      const message = `unable to find prism language '${diffLanguage}' for highlighting.`

      const lang = diffLanguage.toLowerCase()
      if (!unsupportedLanguages.has(lang)) {
        console.warn(message, `applying generic code block`)
        unsupportedLanguages.add(lang)
      }
      // Ignore diffLanguage when it does not exist.
      diffLanguage = null
    }
  }

  const grammar = Prism.languages[language]
  const highlighted = code
    .split(`\n`)
    .map((codeLine, index) =>
      lineNumbersOutput.includes(index + 1)
        ? codeLine
        : Prism.highlight(
            codeLine,
            grammar,
            diffLanguage ? `${language}-${diffLanguage}` : language
          )
    )
    .join(`\n`)

  const codeSplits = handleDirectives(highlighted, lineNumbersHighlight)

  let finalCode = ``
  const lastIdx = codeSplits.length - 1 // Don't add back the new line character after highlighted lines
  // as they need to be display: block and full-width.

  codeSplits.forEach((split, idx) => {
    finalCode += split.highlight
      ? split.code
      : `${split.code}${idx == lastIdx ? `` : `\n`}`
  })
  return finalCode
}
