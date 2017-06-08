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

    node.data = {
      hChildren: [
        {
          type: `raw`,
          value: highlightCode(language, node.value, highlightLines),
        },
      ],
    }
  })
}
