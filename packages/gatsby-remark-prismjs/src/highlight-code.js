const Prism = require(`prismjs`)
const _ = require(`lodash`)

const loadPrismLanguage = require(`./load-prism-language`)

module.exports = (language, code, lineNumbersHighlight = []) => {
  // (Try to) load languages on demand.
  if (!Prism.languages[language]) {
    try {
      loadPrismLanguage(language)
    } catch (e) {
      // Language wasn't loaded so let's bail.
      return code
    }
  }

  const lang = Prism.languages[language]

  let highlightedCode = Prism.highlight(code, lang)
  if (lineNumbersHighlight) {
    const codeSplits = highlightedCode.split(`\n`).map((split, i) => {
      if (_.includes(lineNumbersHighlight, i + 1)) {
        return {
          highlighted: true,
          code: `<span class="gatsby-highlight-code-line">${split}\n</span>`,
        }
      } else {
        return { code: split }
      }
    })

    highlightedCode = ``
    // Don't add a new line character after highlighted lines as they
    // need to be display: block and full-width.
    codeSplits.forEach(split => {
      split.highlighted
        ? (highlightedCode += split.code)
        : (highlightedCode += `${split.code}\n`)
    })
  }

  return highlightedCode
}
