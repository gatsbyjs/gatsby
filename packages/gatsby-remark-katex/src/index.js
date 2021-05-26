const visit = require(`unist-util-visit`)
const katex = require(`katex`)
const remarkMath = require(`remark-math`)
const unified = require(`unified`)
const parse = require(`rehype-parse`)

module.exports = ({ markdownAST }, pluginOptions = {}) => {
  const parseHtml = unified().use(parse, { fragment: true, position: false })

  visit(markdownAST, `inlineMath`, node => {
    const renderedKatexString = katex.renderToString(node.value, {
      displayMode: false,
      ...pluginOptions,
    })
    node.data.hChildren = parseHtml.parse(renderedKatexString).children
  })

  visit(markdownAST, `math`, node => {
    const renderedKatexString = katex.renderToString(node.value, {
      displayMode: true,
      ...pluginOptions,
    })
    node.data.hChildren = parseHtml.parse(renderedKatexString).children
  })
}

module.exports.setParserPlugins = () => [remarkMath]
