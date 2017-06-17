const visit = require(`unist-util-visit`)

const parseLineNumberRange = require(`./parse-line-number-range`)
const highlightCode = require(`./highlight-code`)

module.exports = ({ markdownAST }) => {
  visit(markdownAST, `code`, node => {
    let language = node.lang
    let { splitLanguage, highlightLines } = parseLineNumberRange(language)
    language = splitLanguage

    if (language) {
      language = language.toLowerCase()
    }

    // Replace the node with the markup we need to make
    // 100% width highlighted code lines work
    node.type = `html`
    node.value = `<div class="gatsby-highlight"><pre><code>${highlightCode(
      language,
      node.value,
      highlightLines
    )}</code></pre></div>`
  })
}
