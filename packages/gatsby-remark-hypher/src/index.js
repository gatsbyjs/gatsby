const visit = require(`unist-util-visit`)
const Hypher = require(`hypher`)

module.exports = ({ markdownAST }, pluginOptions = {}) => {
  const lang = pluginOptions.language
    ? pluginOptions.language
    : require(`hyphenation.en-us`)
  if (pluginOptions.leftMin) {
    lang.leftmin = pluginOptions.leftMin
  }
  if (pluginOptions.rightMin) {
    lang.rightmin = pluginOptions.rightMin
  }
  if (pluginOptions.exceptions) {
    lang.exceptions = pluginOptions.exceptions
  }
  if (pluginOptions.patterns) {
    lang.patterns = pluginOptions.patterns
  }
  const hyphenator = new Hypher(lang)
  visit(markdownAST, `text`, node => {
    node.value = hyphenator.hyphenateText(
      node.value,
      pluginOptions.minLength || 4
    )
  })
  return markdownAST
}
