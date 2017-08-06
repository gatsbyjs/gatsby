const retext = require(`retext`)
const visit = require(`unist-util-visit`)
const smartypants = require(`retext-smartypants`)
const _ = require(`lodash`)

module.exports = {
  parse: ({ markdownAST }, pluginOptions = {}) => {
    visit(markdownAST, `text`, node => {
      const processedText = String(
        retext().use(smartypants, pluginOptions).process(node.value)
      )
      node.value = processedText
    })

    return markdownAST
  }
}
