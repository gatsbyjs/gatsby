const visit = require(`unist-util-visit`)
const katex = require(`katex`)
const remarkMath = require(`remark-math`)

module.exports = ({ markdownAST }) => {
  visit(markdownAST, `inlineMath`, node => {
    node.type = `html`
    node.value = katex.renderToString(node.value, {
      displayMode: false,
      throwOnError: false,
    })
  })

  visit(markdownAST, `math`, node => {
    node.type = `html`
    node.value = katex.renderToString(node.value, {
      displayMode: true,
      throwOnError: false,
    })
  })
}

module.exports.setParserPlugins = () => [remarkMath]
