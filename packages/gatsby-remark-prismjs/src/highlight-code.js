const Prism = require(`prismjs`)
const _ = require(`lodash`)

const loadPrismLanguage = require(`./load-prism-language`)
const handleDirectives = require(`./directives`)

module.exports = (language, code, lineNumbersHighlight = []) => {
  // (Try to) load languages on demand.
  if (!Prism.languages[language]) {
    try {
      loadPrismLanguage(language)
    } catch (e) {
      // Language wasn't loaded so let's bail.
      if (language === `none`) {
        return code // Don't escape if set to none.
      } else {
        return _.escape(code)
      }
    }
  }

  const grammar = Prism.languages[language]

  const highlighted = Prism.highlight(code, grammar, language)
  const codeSplits = handleDirectives(highlighted, lineNumbersHighlight)

  let finalCode = ``

  const lastIdx = codeSplits.length - 1
  // Don't add back the new line character after highlighted lines
  // as they need to be display: block and full-width.
  codeSplits.forEach((split, idx) => {
    split.highlight
      ? (finalCode += split.code)
      : (finalCode += `${split.code}${idx == lastIdx ? `` : `\n`}`)
  })

  return finalCode
}
