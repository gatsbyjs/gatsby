const Prism = require(`prismjs`)
const _ = require(`lodash`)

const loadPrismLanguage = require(`./load-prism-language`)

const plainTextWithLFTest = /<span class="token plain-text">[^<]*\n[^<]*<\/span>/g

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

  let highlightedCode = Prism.highlight(code, grammar, language)
  if (lineNumbersHighlight.length > 0) {
    // HACK split plain-text spans with line separators inside into multiple plain-text spans
    // separatered by line separator - this fixes line highlighting behaviour for jsx
    highlightedCode = highlightedCode.replace(plainTextWithLFTest, match =>
      match.replace(/\n/g, `</span>\n<span class="token plain-text">`)
    )

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
