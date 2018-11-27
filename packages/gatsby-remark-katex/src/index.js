const visit = require(`unist-util-visit`)
const katex = require(`katex`)
const remarkMath = require(`remark-math`)

module.exports = ({ markdownAST, reporter }) => {
  visit(markdownAST, `inlineMath`, node => {
    node.type = `html`

    try {
      node.value = katex.renderToString(node.value, {
        displayMode: false,
      })
    } catch (err) {
      reporter.panicOnBuild(`KaTeX rendering error: ${err.message}`)
    }
  })

  visit(markdownAST, `math`, node => {
    node.type = `html`

    try {
      node.value = katex.renderToString(node.value, {
        displayMode: true,
      })
    } catch (err) {
      reporter.panicOnBuild(`KaTeX rendering error: ${err.message}`)
    }
  })
}

module.exports.setParserPlugins = () => [remarkMath]
