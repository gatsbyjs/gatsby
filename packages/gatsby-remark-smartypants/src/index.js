const retext = require(`retext`)
const visit = require(`unist-util-visit`)
const smartypants = require(`retext-smartypants`)
const _ = require('lodash')

module.exports = ({ markdownAST pluginOptions }) => {
  visit(markdownAST, `text`, node => {
    const defaultOptions = {}
    const options = _.defaults(pluginOptions, defaultOptions)
    const processedText = String(retext().use(smartypants, options).process(node.value))
    node.value = processedText
  })
}
