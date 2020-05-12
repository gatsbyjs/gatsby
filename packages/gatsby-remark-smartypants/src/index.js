const retext = require(`retext`)
const visit = require(`unist-util-visit`)
const smartypants = require(`retext-smartypants`)

module.exports = ({ markdownAST }, pluginOptions = {}) => {
  visit(markdownAST, `text`, node => {
    const processedText = String(
      retext().use(smartypants, pluginOptions).processSync(node.value)
    )
    node.value = processedText
  })

  return markdownAST
}
