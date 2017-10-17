const visit = require(`unist-util-visit`)
const katex = require(`katex`)
const remarkMath = require(`remark-math`)

module.exports = ({ markdownAST }) => {
  visit(markdownAST, `inlineMath`, node => {
    node.type = `html`
    node.value = katex.renderToString(node.value, {
      displayMode: false,
    })
  })

  visit(markdownAST, `math`, node => {
    node.type = `html`
    node.value = katex.renderToString(node.value, {
      displayMode: true,
    })
  })
}

module.exports.setParserPlugins = () => [remarkMath]
