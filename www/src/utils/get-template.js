const { slash } = require(`gatsby-core-utils`)

/**
 * Return the template at the given path relative to the templates/ directory.
 *
 * Ex:
 *
 * getTemplate('template-docs-markdown') // returns src/templates/template-docs-markdown.js
 */
function getTemplate(path) {
  return slash(require.resolve(`../templates/${path}.js`))
}

module.exports = {
  getTemplate,
}
