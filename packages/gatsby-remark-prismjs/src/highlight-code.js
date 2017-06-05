const Prism = require(`prismjs`)
const _ = require(`lodash`)

module.exports = (language, code, lineNumbersHighlight = []) => {
  // (Try to) load languages on demand.
  if (!Prism.languages[language]) {
    try {
      require(`prismjs/components/prism-${language}.js`)
    } catch (e) {
      // Language wasn't loaded so let's bail.
      return code
    }
  }

  const lang = Prism.languages[language]

  let highlightedCode = Prism.highlight(code, lang)
  if (lineNumbersHighlight) {
    highlightedCode = highlightedCode
      .split(`\n`)
      .map((split, i) => {
        if (_.includes(lineNumbersHighlight, i + 1)) {
          return `<span class="highlight-code-line">${split}</span>`
        } else {
          return split
        }
      })
      .join(`\n`)
  }

  return highlightedCode
}
