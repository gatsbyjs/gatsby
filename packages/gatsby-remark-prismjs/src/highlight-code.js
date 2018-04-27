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
      if (language === `none`) {
        return code // Don't escape if set to none.
      } else {
        return _.escape(code)
      }
    }
  }

  const lang = Prism.languages[language]

  let highlightedCode = Prism.highlight(code, lang)
  if (lineNumbersHighlight.length > 0) {
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
    const lastIdx = codeSplits.length - 1
    // Don't add back the new line character after highlighted lines
    // as they need to be display: block and full-width.
    codeSplits.forEach((split, idx) => {
      split.highlighted
        ? (highlightedCode += split.code)
        : (highlightedCode += `${split.code}${idx == lastIdx ? `` : `\n`}`)
    })
  }

  return highlightedCode
}
