const visit = require(`unist-util-visit`)
const katex = require(`katex`)
const remarkMath = require(`remark-math`)

module.exports = ({ markdownAST }) => {
  visit(markdownAST, `inlineMath`, node => {
    node.type = `html`
    node.value = katex.renderToString(node.value, {
      displayMode: false,
      throwOnError: false,
      errorColor: `#cc0000`,
      strict: `warn`,
    })
  })

  visit(markdownAST, `math`, node => {
    node.type = `html`
    node.value = katex.renderToString(node.value, {
      displayMode: true,
      throwOnError: false,
      errorColor: `#cc0000`,
      strict: `warn`,
    })
  })
}

module.exports.setParserPlugins = () => [remarkMath]
