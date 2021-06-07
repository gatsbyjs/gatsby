const visit = require(`unist-util-visit`)
const katex = require(`katex`)
const remarkMath = require(`remark-math`)
const unified = require(`unified`)
const parse = require(`rehype-parse`)

module.exports = ({ markdownAST }, pluginOptions = {}) => {
  visit(markdownAST, `inlineMath`, node => {
    node.data.hChildren = unified()
      .use(parse, { fragment: true, position: false })
      .parse(
        katex.renderToString(node.value, {
          displayMode: false,
          ...pluginOptions,
        })
      ).children
  })

  visit(markdownAST, `math`, node => {
    node.data.hChildren = unified()
      .use(parse, { fragment: true, position: false })
      .parse(
        katex.renderToString(node.value, {
          displayMode: true,
          ...pluginOptions,
        })
      ).children
  })
}

module.exports.setParserPlugins = () => [remarkMath]
