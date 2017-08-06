const visit = require(`unist-util-visit`)
const katex = require(`katex`)

module.exports = {
  getParserPlugins: () => [require('remark-math')],
  parse: ({ markdownAST }) => {
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
}
