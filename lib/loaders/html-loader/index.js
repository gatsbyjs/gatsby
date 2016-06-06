/* @flow weak */
import htmlFrontMatter from 'html-frontmatter'
import objectAssign from 'object-assign'

module.exports = function (content) {
  this.cacheable()
  const data = objectAssign({}, htmlFrontMatter(content), { body: content })
  this.value = data
  return `module.exports = ${JSON.stringify(data)}`
}
